// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.18;

// import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
// import "@openzeppelin/contracts/proxy/ProxyAdmin.sol";

// contract ProposalFactory {
//     address public implementation;
//     ProxyAdmin public proxyAdmin;

//     event ProposalCreated(address indexed proxyAddress, uint256 proposalId);

//     uint256 public proposalCount;

//     constructor(address _implementation) {
//         implementation = _implementation;
//         proxyAdmin = new ProxyAdmin();
//     }

//     function createProposal(string memory description) external {
//         bytes memory data = abi.encodeWithSignature("initialize(string)", description);

//         TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
//             implementation,
//             address(proxyAdmin),
//             data
//         );

//         proposalCount++;
//         emit ProposalCreated(address(proxy), proposalCount);
//     }
// }
