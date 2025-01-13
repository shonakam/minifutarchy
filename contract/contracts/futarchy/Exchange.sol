// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./target/Proposal.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";

contract Exchange {
    uint256 public constant DECIMALS = 10**18; // 固定小数点スケール
    uint256 public constant FEE_PERCENTAGE = 0; // 1%の手数料

    // スケール変換関数
    function toDecimal(uint256 value) public pure returns (uint256) { return value / DECIMALS; }

    // コスト計算関数
    function calculateCost(
        uint256 inputReserve,
        uint256 outputReserve,
        uint256 inputAmount
    ) public pure returns (uint256 outputAmount) {
        require(inputAmount > 0, "Input amount must be greater than 0");
        uint256 newInputReserve = inputReserve + inputAmount;
        uint256 newOutputReserve = (inputReserve * outputReserve) / newInputReserve;
        outputAmount = outputReserve - newOutputReserve;
        return outputAmount;
    }

    // イベント定義
    event LiquidityAdded(address indexed user, uint256 yesAmount, uint256 noAmount);
    event LiquidityRemoved(address indexed user, uint256 yesAmount, uint256 noAmount);
    event Merged(address indexed user, address indexed proposal, uint256 amount);
    event Voted(address indexed user, address indexed proposal, uint256 collateralAmount, bool isYes, uint256 mintedAmount, uint256 lockedAmount);
    event Swapped(address indexed user, uint256 inputAmount, uint256 outputAmount, bool isYesToNo);

    // 流動性を追加
    function addLiquidity(address proposal, uint256 collateralAmount) external {
        uint256 collateralAmountYes = collateralAmount / 2;
        uint256 collateralAmountNo = collateralAmount / 2;

        IProposal proposalInstance = IProposal(proposal);

        require(collateralAmountYes > 0 && collateralAmountNo > 0, "Invalid amounts");

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(collateral.transferFrom(msg.sender, address(proposal), collateralAmount), "Transfer failed");

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(collateralAmountYes, collateralAmountNo, true);

        // LP トークンをミント
        proposalInstance.mint(msg.sender, proposalInstance.LPT(), collateralAmount);

        emit LiquidityAdded(msg.sender, collateralAmountYes, collateralAmountNo);
    }

    // 流動性を削除
    function removeLiquidity(address proposal, uint256 lpAmount) external {
        IProposal proposalInstance = IProposal(proposal);

        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();
        uint256 totalLP = proposalInstance.getTotalLpt();

        require(lpAmount > 0 && lpAmount <= totalLP, "Invalid LP amount");

        // 引き出すトークン量を計算
        uint256 yesAmount = (yesReserve * lpAmount) / totalLP;
        uint256 noAmount = (noReserve * lpAmount) / totalLP;

        // LP トークンをバーン
        proposalInstance.burn(msg.sender, proposalInstance.LPT(), lpAmount);

        // YES/NO トークンを返却
        proposalInstance.mint(msg.sender, proposalInstance.YES(), yesAmount);
        proposalInstance.mint(msg.sender, proposalInstance.NO(), noAmount);

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(yesAmount, noAmount, true);
        emit LiquidityRemoved(msg.sender, yesAmount, noAmount);
    }

    function split(
        Proposal proposal, uint256 collateralAmount, bool isYes
    ) internal view returns (uint256 mintedAmount, uint256 lockedAmount) {
        (uint256 yesReserve, uint256 noReserve) = proposal.getMarketReserves(); // 現在のReserveを取得
        require(yesReserve > 0 && noReserve > 0, "Invalid market reserves");

        // YES トークンと NO トークンをリザーブ比率に基づき動的に分割, 投票後のリザーブ計算 cpmm
        uint256 k = yesReserve * noReserve;
        uint256 newYesReserve = isYes ? yesReserve + collateralAmount : yesReserve;
        uint256 newNoReserve = isYes ? k / newYesReserve : noReserve + collateralAmount;
        // 引き出し量と mint, lock される量の計算
        mintedAmount = isYes ? newYesReserve - yesReserve : newNoReserve - noReserve;
        lockedAmount = collateralAmount - mintedAmount;
        return (mintedAmount, lockedAmount);
    }
    // 投票機能
    function vote(address proposal, uint256 collateralAmount, bool isYes) external {
        require(collateralAmount > 0, "Invalid input amount");
        Proposal proposalInstance = Proposal(proposal);

        // コラテラルトークンを転送
        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(
            collateral.transferFrom(msg.sender, address(proposal), collateralAmount),
            "Collateral transfer failed"
        );

        (uint256 mintedAmount, uint256 lockedAmount) = split(proposalInstance, collateralAmount, isYes);
        uint256 mintedTokenId = isYes ? proposalInstance.YES() : proposalInstance.NO();
        uint256 lockedTokenId = isYes ? proposalInstance.NO() : proposalInstance.YES();
    
        proposalInstance.mint(msg.sender, mintedTokenId, mintedAmount);
        proposalInstance.mint(address(this), lockedTokenId, lockedAmount);

        proposalInstance.updateMarketReserves(mintedAmount, lockedAmount, isYes);
        proposalInstance.updateUserLocked(msg.sender, lockedTokenId, lockedAmount, true);
        emit Voted(msg.sender, proposal, collateralAmount, isYes, mintedAmount, lockedAmount);

        // // 手数料の計算 一旦無視（0%）
        // uint256 fee = (collateralAmount * FEE_PERCENTAGE) / 100;
        // uint256 adjustedAmount = collateralAmount - fee;
    }

    // スワップ機能
    function swap(
        address proposal,
        uint256 inputAmount,
        bool isYesToNo,
        uint256 minOutputAmount
    ) external {
        Proposal proposalInstance = Proposal(proposal);

        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();

        uint256 inputReserve = isYesToNo ? yesReserve : noReserve;
        uint256 outputReserve = isYesToNo ? noReserve : yesReserve;

        require(inputAmount > 0, "Invalid input amount");

        // CPMM ロジックによる出力量の計算
        uint256 outputAmount = calculateCost(inputReserve, outputReserve, inputAmount);

        require(outputAmount >= minOutputAmount, "Slippage exceeded");

        // トークンをバーン / ミント
        proposalInstance.burn(msg.sender, isYesToNo ? proposalInstance.YES() : proposalInstance.NO(), inputAmount);
        proposalInstance.mint(msg.sender, isYesToNo ? proposalInstance.NO() : proposalInstance.YES(), outputAmount);

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(inputAmount, outputAmount, isYesToNo);

        emit Swapped(msg.sender, inputAmount, outputAmount, isYesToNo);
    }

    function redeemBeforeResolution(address proposal, uint256 amount, bool isYes) external {
        Proposal proposalInstance = Proposal(proposal);
        require(!proposalInstance.isClose(), "Market already resolved");

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();
        require(yesReserve > 0 && noReserve > 0, "Invalid market reserves");

        // 比率に基づく償還量計算
        uint256 price = isYes
            ? (noReserve * DECIMALS) / (yesReserve + noReserve)
            : (yesReserve * DECIMALS) / (yesReserve + noReserve);
        uint256 collateralAmount = (amount * price) / DECIMALS;

        // トークン残高確認
        (, uint256 yesBalance, uint256 noBalance) = proposalInstance.getUserBalances(msg.sender);
        if (isYes) {
            require(yesBalance >= amount, "Insufficient token balance");
        } else {
            require(noBalance >= amount, "Insufficient token balance");
        }

        uint256 outputAmount = (amount * price) / DECIMALS; 

        proposalInstance.approveCollateral(collateralAmount);
        collateral.transferFrom(proposal, msg.sender, collateralAmount);
        proposalInstance.burn(msg.sender, isYes ? proposalInstance.YES() : proposalInstance.NO(), amount);
        proposalInstance.updateMarketReserves(amount, outputAmount, isYes);
    }

    function redeemAfterResolution(address proposal, uint256 amount, bool isYes) external {
        Proposal proposalInstance = Proposal(proposal);
        require(proposalInstance.isClose(), "Market not resolved");
        require(proposalInstance.result() == isYes, "Cannot redeem losing tokens");

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        
        uint256 balance = proposalInstance.balanceOf(
            msg.sender, isYes ? proposalInstance.YES() : proposalInstance.NO()
        );
        require(balance >= amount, "Insufficient token balance");

        proposalInstance.burn(msg.sender, isYes ? proposalInstance.YES() : proposalInstance.NO(), amount);
        proposalInstance.approveCollateral(amount);
        collateral.transferFrom(proposal, msg.sender, amount);
    }

    // コスト計算結果を確認するための関数
    function getSwapOutput(
        address proposal,
        uint256 inputAmount,
        bool isYesToNo
    ) external view returns (uint256) {
        Proposal proposalInstance = Proposal(proposal);
        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();

        uint256 inputReserve = isYesToNo ? yesReserve : noReserve;
        uint256 outputReserve = isYesToNo ? noReserve : yesReserve;

        return calculateCost(inputReserve, outputReserve, inputAmount);
    }
}
