// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./target/Proposal.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    event Voted(address indexed voter, address proposal, uint256 amount, bool isYes);
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

    // 投票機能
    function vote(address proposal, uint256 collateralAmount, bool isYes) external {
        Proposal proposalInstance = Proposal(proposal);

        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();

        uint256 inputReserve = isYes ? yesReserve : noReserve;
        uint256 outputReserve = isYes ? noReserve : yesReserve;

        require(collateralAmount > 0, "Invalid input amount");

        // 手数料の計算
        uint256 fee = (collateralAmount * FEE_PERCENTAGE) / 100;
        uint256 adjustedAmount = collateralAmount - fee;

        // CPMM ロジックによる出力量の計算
        uint256 outputAmount = calculateCost(inputReserve, outputReserve, adjustedAmount);

        require(outputAmount > 0, "Insufficient liquidity");

        // コラテラルトークンを転送
        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(collateral.transferFrom(msg.sender, address(proposal), collateralAmount), "Collateral transfer failed");

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(adjustedAmount, outputAmount, isYes);

        // YES/NO トークンをミント
        uint256 mintedTokenId = isYes ? proposalInstance.YES() : proposalInstance.NO();
        proposalInstance.mint(msg.sender, mintedTokenId, outputAmount);

        emit Voted(msg.sender, proposal, adjustedAmount, isYes);
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

        // 入力トークンをバーン
        proposalInstance.burn(msg.sender, isYesToNo ? proposalInstance.YES() : proposalInstance.NO(), inputAmount);

        // 出力トークンをミント
        proposalInstance.mint(msg.sender, isYesToNo ? proposalInstance.NO() : proposalInstance.YES(), outputAmount);

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(inputAmount, outputAmount, isYesToNo);

        emit Swapped(msg.sender, inputAmount, outputAmount, isYesToNo);
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
