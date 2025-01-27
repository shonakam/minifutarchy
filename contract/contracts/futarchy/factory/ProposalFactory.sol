// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../target/Proposal.sol";
import "../Exchange.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "hardhat/console.sol";

contract ProposalFactory {
    address public implementation;
    address public exchange;

    struct ProposalData {
        address submitter;
        address proposalAddress;
        string title;
        string description;
        string threshold;
        uint256 start;
        uint256 duration;
        address collateralToken;
    }

    mapping(uint256 => address) public proposals;
    mapping(address => ProposalData) public proposalDetails;
    uint256 public nextProposalId;

    event ProposalCreated(
        uint256 proposalId, address indexed proposal, address indexed collateralToken
    );

    constructor(address _implementation, address _exchange) {
        implementation = _implementation;
        exchange = _exchange;
    }

    function getProposal(uint256 id) external view returns (address) { return proposals[id]; }

    function createProposal(
        string memory _title,
        string memory _description,
        string memory _threshold,
        uint256 _duration,
        address _collateralToken
    ) external returns (address) {
        address clone = Clones.clone(implementation);
        Proposal(clone).initialize(
            msg.sender,
            _title,
            _description,
            _threshold,
            block.timestamp,
            _duration,
            exchange,
            _collateralToken
        );

        proposals[nextProposalId] = clone;
        proposalDetails[clone] = ProposalData({
            submitter: msg.sender,
            proposalAddress: clone,
            title: _title,
            description: _description,
            threshold: _threshold,
            start: block.timestamp,
            duration: _duration,
            collateralToken: _collateralToken
        });
        emit ProposalCreated(nextProposalId++, clone, _collateralToken);
        return clone;
    }

    function getProposalDetails(address proposalAddress)
        external view returns (ProposalData memory)  {
            return proposalDetails[proposalAddress];
    }

    function getProposalDetailsInRange(uint256 start, uint256 end)
        external
        view
        returns (ProposalData[] memory)
    {
        require(end > start, "Invalid range");
        require(end <= nextProposalId, "Range exceeds total proposals");

        ProposalData[] memory rangeDetails = new ProposalData[](end - start);

        for (uint256 i = start; i < end; i++) {
            address proposalAddress = proposals[i];
            rangeDetails[i - start] = proposalDetails[proposalAddress];
        }

        return rangeDetails;
    }

    function hello() external pure returns (string memory) { return "hello"; }
}
