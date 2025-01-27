// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Proposal is ERC1155Supply, IERC1155Receiver {
    address public submitter;
    string public title;
    string public description;
    string public threshold;
    uint256 public start;
    uint256 public duration;

    address public factory;
    address public exchange;
    IERC20 public collateralToken;

    bool private initialized;
    bool public hasInitLiquidity;
    bool public isClose = false;
    bool public result = false;
    uint256 public constant LPT = 0;
    uint256 public constant YES = 1;
    uint256 public constant NO = 2;

    mapping(address => bool) public whitelist;
    mapping(uint256 => uint256) public marketReserves;
    mapping(address => mapping(uint256 => uint256)) public userVoted;

    modifier onlyExchange() {
        require(msg.sender == exchange, "Not authorized");
        _;
    }

    modifier onlyWhitelisted() {
        require(msg.sender == submitter || whitelist[msg.sender], "Not authorized");
        _;
    }

    event InitialLiquidityAdded(address indexed user, uint256 yesAmount, uint256 noAmount);
    event ERC1155TokenReceived(address operator, address from, uint256 id, uint256 value, bytes data);
    event ERC1155BatchTokensReceived(address operator, address from, uint256[] ids, uint256[] values, bytes data);

    constructor() ERC1155("") {}
    
    function onERC1155Received(
        address operator, address from, uint256 id, uint256 value, bytes calldata data
    ) external override returns (bytes4) {
        emit ERC1155TokenReceived(operator, from, id, value, data);
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data
    ) external override returns (bytes4) {
        emit ERC1155BatchTokensReceived(operator, from, ids, values, data);
        return this.onERC1155BatchReceived.selector; 
    }

    function addToWhitelist(address _address) external {
        require(msg.sender == submitter, "Only admin can add to whitelist");
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) external {
        require(msg.sender == submitter, "Only admin can remove from whitelist");
        whitelist[_address] = false;
    }

    function initialize(
        address _submitter,
        string memory _title,
        string memory _description,
        string memory _threshold,
        uint256 _start,
        uint256 _duration,
        address _exchange,
        address _collateralToken
    ) external {
        require(!initialized, "Already initialized");
        factory = msg.sender;
        submitter = _submitter;
        title = _title;
        description = _description;
        threshold = _threshold;
        start = _start;
        duration = _duration;
        exchange = _exchange;
        collateralToken = IERC20(_collateralToken);
        initialized = true;
        hasInitLiquidity = false;
    }

    function setResult(bool _result) external onlyWhitelisted() {
        require(block.timestamp >= start + duration, "Voting period is not over yet");
        require(!isClose, "Proposal is already closed");

        result = _result;
        isClose = true;
    }

    function mint(address to, uint256 id, uint256 amount) external onlyExchange {
        require(id == YES || id == NO || id == LPT, "Invalid token ID");
        _mint(address(this), id, amount, "");
        if (to != address(this)) userVoted[to][id] += amount;
    }

    function burn(address from, uint256 id, uint256 amount) external onlyExchange {
        require(id == YES || id == NO || id == LPT, "Invalid token ID");
        _burn(address(this), id, amount);
        if (from != address(this)) userVoted[from][id] -= amount;
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y; // 幾何平均による初期LPトークンの計算: √(yesAmount * noAmount)
    }
    function initializeLiquidity(uint256 amount) external {
        require(!hasInitLiquidity, "Liquidity already initialized");
        require(amount > 0, "Invalid initial liquidity amounts");

        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "Collateral transfer failed"
        );

        marketReserves[YES] = amount;
        marketReserves[NO] = amount;

        uint256 lpAmount = sqrt(amount * amount);
        require(lpAmount > 0, "Invalid LP token amount");
  
        uint256[] memory ids = new uint256[](3);
        ids[0] = LPT; ids[1] = YES; ids[2] = NO;
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = lpAmount; amounts[1] = amount; amounts[2] = amount;
        _mintBatch(msg.sender, ids, amounts, "");

        hasInitLiquidity = true;
        emit InitialLiquidityAdded(msg.sender, amount, amount);
    }

    function updateMarketReserves(uint256 mintedAmount, uint256 lockedAmount, bool isYes) external onlyExchange {
      if (isYes) {
          marketReserves[YES] += mintedAmount;
          marketReserves[NO] -= lockedAmount;
      } else {
          marketReserves[NO] += mintedAmount;
          marketReserves[YES] -= lockedAmount;
      }
    }

    function getMarketReserves() external view returns (uint256 yesReserve, uint256 noReserve) {
      yesReserve = marketReserves[YES];
      noReserve = marketReserves[NO];
    }

    function getMarketCollateralBalance() external view returns (uint256 balacne) {
        return collateralToken.balanceOf(address(this));
    }

    function getUserBalances(address user) external view returns (uint256 lptBalance, uint256 yesBalance, uint256 noBalance) {
      lptBalance = balanceOf(user, LPT);
      yesBalance = userVoted[user][YES];
      noBalance = userVoted[user][NO];
    }
  
    function getBalancesForUsers(address[] calldata users) external view returns (
        uint256[] memory lptBalances, uint256[] memory yesBalances, uint256[] memory noBalances
    ) {
        uint256 userCount = users.length;

        lptBalances = new uint256[](userCount);
        yesBalances = new uint256[](userCount);
        noBalances = new uint256[](userCount);

        for (uint256 i = 0; i < userCount; i++) {
            lptBalances[i] = balanceOf(users[i], LPT);
            yesBalances[i] = balanceOf(users[i], YES);
            noBalances[i] = balanceOf(users[i], NO);
        }
    }

    function approveCollateral(uint256 amount) external onlyExchange {
        collateralToken.approve(exchange, amount);
    }

    function getVotePressure() public view returns (int256) {
        uint256 yesReserve = marketReserves[YES];
        uint256 noReserve = marketReserves[NO];

        require(yesReserve + noReserve > 0, "Total reserves must be greater than zero");
        require(int256(yesReserve) >= 0, "YES reserve cannot be negative");
        require(int256(noReserve) >= 0, "NO reserve cannot be negative");
        require(yesReserve <= uint256(type(int256).max), "YES reserve exceeds int256 max value");
        require(noReserve <= uint256(type(int256).max), "NO reserve exceeds int256 max value");

        int256 yes = int256(yesReserve);
        int256 no = int256(noReserve);
        int256 votePressure = (yes - no) * 1e18 / (yes + no);
        return votePressure;
    }

    function getProposalData() external view returns (
        address, string memory, string memory, string memory, uint256, uint256, address
    ) {
        return (
            submitter,
            title,
            description,
            threshold,
            start,
            duration,
            address(collateralToken)
        );
    }
    function getTotalLpt() external view returns (uint256) { return totalSupply(LPT); }
    function getTotalYes() external view returns (uint256) { return totalSupply(YES); }
    function getTotalNo() external view returns (uint256) { return totalSupply(NO); }
}
