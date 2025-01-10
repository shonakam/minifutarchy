// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TargetV1 {
    uint256 public value;
    address public owner;

    event ValueChanged(uint256 newValue);

    function initialize(address _owner) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
    }

    function setValue(uint256 _value) external {
        require(msg.sender == owner, "Not the owner");
        value = _value;
        emit ValueChanged(_value);
    }
}
