// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./target/Proposal.sol";
import "./interface/IProposal.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC1155.sol";
import "hardhat/console.sol";

contract Exchange {
    uint256 public constant SCALE = 1e18; // 固定小数点スケール
    uint256 public constant FEE_PERCENTAGE = 0; // 1%の手数料

    // イベント定義
    event LiquidityAdded(address indexed user, uint256 yesAmount, uint256 noAmount);
    event LiquidityRemoved(address indexed user, uint256 yesAmount, uint256 noAmount);
    event Merged(address indexed user, address indexed proposal, uint256 amount);
    event Voted(address indexed user, address indexed proposal, uint256 collateralAmount, bool isYes, uint256 mintedAmount, uint256 burnedAmount);
    event Swapped(address indexed user, uint256 inputAmount, uint256 outputAmount, bool isYesToNo);
    event Redeemed(address indexed user, address indexed proposal, uint256 amount, uint256 collateralAmount, bool isYes);

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

    function _split(
        Proposal proposal, uint256 collateralAmount, bool isYes
    ) internal view returns (uint256 mintedAmount, uint256 burnedAmount) {
        (uint256 yesReserve, uint256 noReserve) = proposal.getMarketReserves(); // 現在のReserveを取得
        require(yesReserve > 0 && noReserve > 0, "Invalid market reserves");

        // YES トークンと NO トークンをリザーブ比率に基づき動的に分割, 投票後のリザーブ計算 cpmm
        uint256 k = yesReserve * noReserve;
        uint256 rate;
        uint256 ratedAmount;
        uint256 newYesReserve;
        uint256 newNoReserve;

        if (isYes) {
            rate = getRate(noReserve, yesReserve);
            ratedAmount = (collateralAmount * rate) / SCALE;
            newNoReserve = noReserve + ratedAmount;
            newYesReserve = k / newNoReserve;
        } else {
            rate = getRate(yesReserve, noReserve);
            ratedAmount = (collateralAmount * rate) / SCALE;
            newYesReserve = yesReserve + ratedAmount;
            newNoReserve = k / newYesReserve;
        }

        mintedAmount = isYes ? newNoReserve - noReserve : newYesReserve - yesReserve;
        burnedAmount = isYes ? yesReserve - newYesReserve : noReserve - newNoReserve;
        return (mintedAmount, burnedAmount);
    }
    // 投票機能
    function vote(address proposal, uint256 collateralAmount, bool isYes) external {
        require(collateralAmount > 0, "Invalid input amount");
        Proposal proposalInstance = Proposal(proposal);

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        require(
            collateral.transferFrom(msg.sender, address(proposal), collateralAmount),
            "Collateral transfer failed"
        );

        (uint256 mintedAmount, uint256 burnedAmount) = _split(proposalInstance, collateralAmount, isYes);

        uint256 mintedTokenId = isYes ? proposalInstance.YES() : proposalInstance.NO();
        uint256 burnedTokenId = isYes ? proposalInstance.NO() : proposalInstance.YES();
        
        proposalInstance.mint(msg.sender, mintedTokenId, mintedAmount);
        proposalInstance.burn(proposal, burnedTokenId, burnedAmount);

        proposalInstance.updateMarketReserves(mintedAmount, burnedAmount, isYes);
        emit Voted(msg.sender, proposal, collateralAmount, isYes, mintedAmount, burnedAmount);

        // // 手数料の計算 一旦無視（0%）
        // uint256 fee = (collateralAmount * FEE_PERCENTAGE) / 100;
        // uint256 adjustedAmount = collateralAmount - fee;
    }

    function _beforeCloseLogic(
        uint256 yesReserve, uint256 noReserve, uint256 amount, bool isYes
    ) internal pure returns(uint256 newYesReserve, uint256 newNoReserve, uint256 collateralAmount)
    {
        uint256 k = yesReserve * noReserve;
        uint256 rate;

        if (isYes) {
            unchecked {
                newYesReserve = yesReserve - amount;
                newNoReserve = k / newYesReserve;
            }
            rate = getRate(yesReserve, noReserve);
        } else {
            unchecked {
                newNoReserve = noReserve - amount;
                newYesReserve = k / newNoReserve;
            }
            rate = getRate(noReserve, yesReserve) / SCALE;
        }

        collateralAmount = (amount * rate) / SCALE;
        return (newYesReserve, newNoReserve, collateralAmount);
    }
    function redeem(address proposal, uint256 amount, bool isYes) external {
        Proposal proposalInstance = Proposal(proposal);
        require(!proposalInstance.isClose(), "Market already resolved");

        IERC20 collateral = IERC20(proposalInstance.collateralToken());
        (uint256 yesReserve, uint256 noReserve) = proposalInstance.getMarketReserves();
        require(yesReserve > 0 && noReserve > 0, "Invalid market reserves");

        (, uint256 yesBalance, uint256 noBalance) = proposalInstance.getUserBalances(msg.sender);
        require(isYes ? yesBalance >= amount : noBalance >= amount, "Insufficient token balance");
        
        if (isYes && amount >= yesBalance) amount = yesBalance;
        else if (!isYes && amount >= noBalance) amount = noBalance;

        uint256 collateralAmount;
        uint256 newYesReserve;
        uint256 newNoReserve;

        if (!proposalInstance.isClose()) {
            (newYesReserve, newNoReserve, collateralAmount) = 
                _beforeCloseLogic(yesReserve, noReserve, amount, isYes);
        } else {
            require(proposalInstance.result() == isYes, "Cannot redeem losing tokens");
            collateralAmount = amount;
        }

        proposalInstance.burn(msg.sender, isYes ? proposalInstance.YES() : proposalInstance.NO(), amount);
        proposalInstance.approveCollateral(collateralAmount);
        require(collateral.transferFrom(
            address(proposal), msg.sender, collateralAmount), "Collateral transfer failed"
        );

        if (!proposalInstance.isClose()) {
            proposalInstance.updateMarketReserves(
                isYes ? newNoReserve - noReserve : newYesReserve - yesReserve,
                isYes ? yesReserve - newYesReserve : noReserve - newNoReserve,
                !isYes // 出力のためを反転
            );
        }
        emit Redeemed(msg.sender, proposal, amount, collateralAmount, isYes);
    }

    function getRate(uint256 numerator, uint256 denominator) public pure returns (uint256) {
        return  (numerator * SCALE / denominator);
    }
}
