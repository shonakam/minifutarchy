// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CollateralMock is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock Collateral Token", "MCT") {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function burn(address from, uint256 amount) external { _burn(from, amount);}
}
