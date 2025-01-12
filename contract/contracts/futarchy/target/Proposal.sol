// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";


interface IProposal {
    // トークン ID 定数
    function LPT() external pure returns (uint256);
    function YES() external pure returns (uint256);
    function NO() external pure returns (uint256);

    // 市場リザーブ情報
    function getMarketReserves() external view returns (uint256 yesReserve, uint256 noReserve);

    // Exchange 操作用
    function mint(address to, uint256 id, uint256 amount) external;
    function burn(address from, uint256 id, uint256 amount) external;
    function updateMarketReserves(uint256 inputAmount, uint256 outputAmount, bool isYesToNo) external;

    // Collateral Token
    function collateralToken() external view returns (address);
    function getTotalLpt() external view returns (uint256);
    function getTotalYes() external view returns (uint256);
    function getTotalNo() external view returns (uint256);
}

contract Proposal is ERC1155Supply {
    address public proposer;
    string public description;
    uint256 public duration;

    address public factory;
    address public exchange;
    IERC20 public collateralToken;

    bool private initialized;
    bool public hasInitLiquidity;
    uint256 public constant LPT = 0; // LP トークン
    uint256 public constant YES = 1; // Yes トークン
    uint256 public constant NO = 2;  // No トークン

    mapping(uint256 => uint256) public marketReserves; // トークンごとのリザーブ量
    modifier onlyExchange() {
        require(msg.sender == exchange, "Not authorized");
        _;
    }

    event InitialLiquidityAdded(address indexed user, uint256 yesAmount, uint256 noAmount);

    constructor() ERC1155("") {}

    function initialize(
        address _proposer,
        string memory _description,
        uint256 _duration,
        address _exchange,
        address _collateralToken
    ) external {
        require(!initialized, "Already initialized");
        factory = msg.sender;
        proposer = _proposer;
        description = _description;
        duration = _duration;
        exchange = _exchange;
        collateralToken = IERC20(_collateralToken);
        initialized = true;
        hasInitLiquidity = false;
    }

    function mint(address to, uint256 id, uint256 amount) external onlyExchange {
        require(id == YES || id == NO || id == LPT, "Invalid token ID");
        _mint(to, id, amount, "");
    }

    function burn(address from, uint256 id, uint256 amount) external onlyExchange {
        require(id == YES || id == NO || id == LPT, "Invalid token ID");
        _burn(from, id, amount);
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    function initializeLiquidity(uint256 yesAmount, uint256 noAmount) external {
        require(!hasInitLiquidity, "Liquidity already initialized");
        require(
            yesAmount > 0 && noAmount > 0 && yesAmount == noAmount,
            "Invalid initial liquidity amounts"
        );

        require(
            collateralToken.transferFrom(msg.sender, address(this), yesAmount + noAmount),
            "Collateral transfer failed"
        );

        marketReserves[YES] = yesAmount;
        marketReserves[NO] = noAmount;

        // 幾何平均による初期LPトークンの計算: √(yesAmount * noAmount)
        uint256 lpAmount = sqrt(yesAmount * noAmount);
        require(lpAmount > 0, "Invalid LP token amount");
        _mint(msg.sender, LPT, lpAmount, "");

        hasInitLiquidity = true;
        emit InitialLiquidityAdded(msg.sender, yesAmount, noAmount);
    }

    function updateMarketReserves(uint256 inputAmount, uint256 outputAmount, bool isYesToNo) external onlyExchange {
        if (isYesToNo) {
            marketReserves[YES] += inputAmount;
            marketReserves[NO] -= outputAmount;
        } else {
            marketReserves[NO] += inputAmount;
            marketReserves[YES] -= outputAmount;
        }
    }

    function getMarketReserves() external view returns (uint256 yesReserve, uint256 noReserve) {
        yesReserve = marketReserves[YES];
        noReserve = marketReserves[NO];
    }

    function getTotalLpt() external view returns (uint256) { return totalSupply(LPT); }
    function getTotalYes() external view returns (uint256) { return totalSupply(YES); }
    function getTotalNo() external view returns (uint256) { return totalSupply(NO); }
}
