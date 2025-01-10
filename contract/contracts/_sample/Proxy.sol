// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Proxy {
	address public implementation;
	address public owner;

	event Upgraded(address newImplementation);

	constructor(address _implementation) {
		implementation = _implementation;
		owner = msg.sender;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Not the owner");
		_;
	}

	function upgrade(address _newImplementation) external onlyOwner {
		implementation = _newImplementation;
		emit Upgraded(_newImplementation);
	}

	fallback() external payable {
		address impl = implementation;
		require(impl != address(0), "Implementation not set");

		assembly {
			// デリゲートコールを実行
			let ptr := mload(0x40)
			calldatacopy(ptr, 0, calldatasize())
			let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
			let size := returndatasize()
			returndatacopy(ptr, 0, size)

			switch result
			case 0 { revert(ptr, size) }
			default { return(ptr, size) }
		}
	}

	receive() external payable {
		// Receive ether function
	}
}
