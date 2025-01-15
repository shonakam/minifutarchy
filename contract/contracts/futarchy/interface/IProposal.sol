// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IProposal {
    // トークン ID 定数
    function LPT() external pure returns (uint256);
    function YES() external pure returns (uint256);
    function NO() external pure returns (uint256);

    // 市場リザーブ情報
    function getMarketReserves() external view returns (uint256 yesReserve, uint256 noReserve);
    function getMarketCollateralBalance() external view returns (uint256 balance);

    // Exchange 操作用
    function mint(address to, uint256 id, uint256 amount) external;
    function burn(address from, uint256 id, uint256 amount) external;
    function updateMarketReserves(uint256 mintedAmount, uint256 lockedAmount, bool isYesToNo) external;

    // Collateral Token
    function collateralToken() external view returns (address);
    function approveCollateral(uint256 amount) external;

    // ユーザーのバランス情報
    function getUserBalances(address user) external view returns (
        uint256 lptBalance, uint256 yesBalance, uint256 noBalance
    );
    function getBalancesForUsers(address[] calldata users) external view returns (
        uint256[] memory lptBalances, uint256[] memory yesBalances, uint256[] memory noBalances
    );

    // 全体の供給量情報
    function getTotalLpt() external view returns (uint256);
    function getTotalYes() external view returns (uint256);
    function getTotalNo() external view returns (uint256);

    // 初期化
    function initialize(
        address _proposer,
        string memory _description,
        uint256 _duration,
        address _exchange,
        address _collateralToken
    ) external;

    // 初期流動性
    function initializeLiquidity(uint256 amount) external;

    // その他
    function sqrt(uint256 x) external pure returns (uint256);
}
