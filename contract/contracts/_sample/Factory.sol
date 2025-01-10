// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Proxy.sol";

contract Factory {
    address public implementation; // Targetのアドレス
    address[] public proxies;

    event ProxyCreated(address proxyAddress);

    constructor(address _implementation) {
        implementation = _implementation;
    }

	function createProxy() external {
		Proxy proxy = new Proxy(implementation);
		proxies.push(address(proxy));
		emit ProxyCreated(address(proxy));
	}

    function getProxies() external view returns (address[] memory) {
        return proxies;
    }
}
