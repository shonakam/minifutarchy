// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CollateralMock is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock Collateral Token", "MCT") {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function burn(address from, uint256 amount) external { _burn(from, amount);}

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        uint256 newAllowance = allowance(msg.sender, spender) + addedValue;
        _approve(msg.sender, spender, newAllowance);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = allowance(msg.sender, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        uint256 newAllowance = currentAllowance - subtractedValue;
        _approve(msg.sender, spender, newAllowance);
        return true;
    }
}
