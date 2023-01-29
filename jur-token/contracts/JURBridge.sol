// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JURBridge {

  ERC20 public token;

  constructor(ERC20 _token) {
    token = _token;
  }

  function transfer(address recipient, uint256 amount) public {
    require(recipient != address(this));
    require(token.transferFrom(recipient, address(this), amount), "Transfer failed");
  }
}