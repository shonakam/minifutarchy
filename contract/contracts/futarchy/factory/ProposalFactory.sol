// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../target/Proposal.sol";
import "../Exchange.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "hardhat/console.sol";

contract ProposalFactory {
    address public implementation;
    address public exchange;

    mapping(uint256 => address) public proposals;
    uint256 public nextProposalId;

    event ProposalCreated(
        uint256 proposalId,
        address indexed proposal,
        address indexed collateralToken
    );

    constructor(address _implementation, address _exchange) {
        implementation = _implementation;
        exchange = _exchange;
    }

    function getProposal(uint256 id) external view returns (address) { return proposals[id]; }

    function createProposal(
        string memory description, uint256 duration, address collateralToken
    ) external returns (address) {
        // Proposal をデプロイ（Minimal Proxy）
        address clone = Clones.clone(implementation);
        Proposal(clone).initialize(msg.sender, description, duration, exchange, collateralToken);

        proposals[nextProposalId] = clone;
        emit ProposalCreated(nextProposalId++, clone, collateralToken);
        return clone;
    }

    // function createClone(address target) internal returns (address result) {
    //     bytes20 targetBytes = bytes20(target);
    //     assembly {
    //         let clone := mload(0x40)
    //         mstore(clone, 0x3d602d80600a3d3981f3)
    //         mstore(add(clone, 0x14), targetBytes)
    //         mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf3)
    //         result := create(0, clone, 0x37)
    //     }
    // }
    function hello() external pure returns (string memory) { return "hello"; }
}
