// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../target/Proposal.sol";

contract ProposalFactory {
    address public implementation;
    address[] public proposals;

    event ProposalCreated(address indexed proposal, string description);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createProposal(string memory description, uint256 duration) external returns (address) {
        address clone = createClone(implementation);

        Proposal(clone).initialize(description, duration);

        proposals.push(clone);
        emit ProposalCreated(clone, description);
        return clone;
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf3)
            result := create(0, clone, 0x37)
        }
    }
}
