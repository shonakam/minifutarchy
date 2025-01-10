// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Proposal is ERC1155 {
    string public description; // Proposal の説明
    uint256 public endTime;    // 投票終了時間
    bool public finalized;     // 結果が確定しているか

    uint256 public constant YES = 1; // Yes トークン ID
    uint256 public constant NO = 2;  // No トークン ID
    uint256 public yesVotes;         // Yes の投票数
    uint256 public noVotes;          // No の投票数

    address public factory; // Factory アドレス

    event Voted(address indexed voter, uint256 tokenId, uint256 amount);
    event Finalized(bool result);

    constructor() ERC1155("https://example.com/metadata/{id}.json") {
        factory = msg.sender; // Factory を設定
    }

    // Proposal を初期化
    function initialize(string memory _description, uint256 _duration) external {
        require(msg.sender == factory, "Not factory");
        require(endTime == 0, "Already initialized");

        description = _description;
        endTime = block.timestamp + _duration;
    }

    // 投票機能
    function vote(uint256 tokenId, uint256 amount) external {
        require(block.timestamp < endTime, "Voting has ended");
        require(tokenId == YES || tokenId == NO, "Invalid tokenId");

        // トークンをミントして投票を記録
        _mint(msg.sender, tokenId, amount, "");

        if (tokenId == YES) {
            yesVotes += amount;
        } else {
            noVotes += amount;
        }

        emit Voted(msg.sender, tokenId, amount);
    }

    // 投票結果の確定
    function finalize() external {
        require(block.timestamp >= endTime, "Voting not ended");
        require(!finalized, "Already finalized");

        finalized = true;
        bool result = yesVotes > noVotes;

        emit Finalized(result);
    }
}
