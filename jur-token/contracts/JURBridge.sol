// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JURBridge {

  ERC20 public token;
  mapping (address => uint256) balances;

  event SwapInitiated(address indexed from, uint256 value);

  constructor(ERC20 _token) {
    token = _token;
  }

  function transfer(address recipient, uint256 amount) public {
    require(recipient != address(this));
    require(token.transferFrom(recipient, address(this), amount), "Transfer failed");
    balances[recipient] += amount;
    emit SwapInitiated(recipient, amount);
  }

  function balanceOf(address target) public view returns(uint256) {
    return balances[target];
  }
}