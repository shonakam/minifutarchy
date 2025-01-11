// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./target/Proposal.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    // 流動性を追加
    function addLiquidity(address proposal, uint256 collateralAmountYes, uint256 collateralAmountNo) external {
        IProposal proposalInstance = IProposal(proposal);

        require(collateralAmountYes > 0 && collateralAmountNo > 0, "Invalid amounts");

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(collateral.transferFrom(msg.sender, address(proposal), collateralAmountYes + collateralAmountNo), "Transfer failed");

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(collateralAmountYes, collateralAmountNo, true);

        // LP トークンをミント
        proposalInstance.mint(msg.sender, proposalInstance.LPT(), collateralAmountYes + collateralAmountNo);
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
    }

    // 投票機能
    function vote(address proposal, uint256 collateralAmount, bool isYes) external {
        Proposal proposalInstance = Proposal(proposal);

        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();

        uint256 inputReserve = isYes ? yesReserve : noReserve;
        uint256 outputReserve = isYes ? noReserve : yesReserve;

        require(collateralAmount > 0, "Invalid input amount");

        // CPMM ロジックによる出力量の計算
        uint256 newInputReserve = inputReserve + collateralAmount;
        uint256 newOutputReserve = (inputReserve * outputReserve) / newInputReserve;
        uint256 outputAmount = outputReserve - newOutputReserve;

        require(outputAmount > 0, "Insufficient liquidity");

        // コラテラルトークンを転送
        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(collateral.transferFrom(msg.sender, address(proposal), collateralAmount), "Collateral transfer failed");

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(collateralAmount, outputAmount, isYes);

        // YES/NO トークンをミント
        uint256 mintedTokenId = isYes ? proposalInstance.YES() : proposalInstance.NO();
        proposalInstance.mint(msg.sender, mintedTokenId, outputAmount);
    }

    // スワップ機能
    function swap(address proposal, uint256 inputAmount, bool isYesToNo) external {
        Proposal proposalInstance = Proposal(proposal);

        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();

        uint256 inputReserve = isYesToNo ? yesReserve : noReserve;
        uint256 outputReserve = isYesToNo ? noReserve : yesReserve;

        require(inputAmount > 0, "Invalid input amount");

        uint256 newInputReserve = inputReserve + inputAmount;
        uint256 newOutputReserve = (inputReserve * outputReserve) / newInputReserve;
        uint256 outputAmount = outputReserve - newOutputReserve;

        require(outputAmount > 0, "Insufficient liquidity");

        // 入力トークンをバーン
        proposalInstance.burn(msg.sender, isYesToNo ? proposalInstance.YES() : proposalInstance.NO(), inputAmount);

        // 出力トークンをミント
        proposalInstance.mint(msg.sender, isYesToNo ? proposalInstance.NO() : proposalInstance.YES(), outputAmount);

        // Proposal のリザーブを更新
        proposalInstance.updateMarketReserves(inputAmount, outputAmount, isYesToNo);
    }
}
