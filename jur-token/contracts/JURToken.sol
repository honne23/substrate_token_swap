// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JURToken is ERC20, Ownable {

  mapping (bytes4 => bool) allowedFunctions;

  constructor(uint256 initialSupply) ERC20("JUR Token", "JUR") {
        _mint(msg.sender, initialSupply);
    }


  /**
   * @dev Constructor
   * @param _allowedFunctions List of functions which are allowed with approve and call

   * Omitted however important for security
   
  constructor(bytes4[] memory _allowedFunctions) public {
    for (uint8 i = 0; i < _allowedFunctions.length; i++) {
      allowedFunctions[_allowedFunctions[i]] = true;
    }
  }
  */

  /**
   * @dev Adds / removes functions from list of functions which are allowed with approve and call
   * @param _sig Signature of function to add / remove
   * @param _valid Whether the function should be added or removed
   */
  function setAllowedFunction(bytes4 _sig, bool _valid) onlyOwner public {
    allowedFunctions[_sig] = _valid;
  }

  // The first 4 bytes of msg.data are the method name. The next 32 bytes are
  // the 20 bytes of address padded to bytes32. From this 36 bytes of data, we
  // start from the end (the LSB) and work back towwards the 16th byte (ie we
  // ignore the first 4 bytes AND the zero padding) creating a uint that can be
  // converted to an address.

  /**
   * @notice Adds / removes functions from list of functions which are allowed with approve and call
   * @param _data List of functions which are allowed with approve and call
   */
  function getAddr(bytes memory _data) internal pure returns(address) {
    uint result = 0;
    for (uint i = 35; i != 15; --i) {
      result += uint(uint8(_data[i])) * (16 ** ((35 - i) * 2));
    }
    return address(uint160(result));
  }

  /**
   * @notice Returns function signature from msg.data
   * @param _data msg.data from which to calculate function signature
   */
  function getSig(bytes memory _data) internal pure returns(bytes4 sig) {
      uint len = _data.length < 4 ? _data.length : 4;
      for (uint i = 0; i < len; i++) {
        uint s1 = uint(uint32(sig));
        uint s2 = uint(uint8(_data[i]));
        sig = bytes4(bytes32(s1 + s2 * (2 ** (8 * (len - 1 - i)))));
      }
  }

  /**
   * @dev Addition to ERC20 token methods. It allows to
   * @dev approve the transfer of value and execute a call with the sent data.   *
   *
   * @param _spender The address that will spend the funds.
   * @param _value The amount of tokens to be spent.
   * @param _data ABI-encoded contract call to call `_to` address.
   *
   * @return true if the call function was executed successfully
   */
  function approveAndCall(address _spender, uint256 _value, bytes memory _data) public payable returns (bool) {
    require(_spender != address(this));
    // Only allow explicitely approved functions to be called
    require(allowedFunctions[getSig(_data)]);
    // First argument must be senders address
    require(getAddr(_data) == msg.sender);

    super.approve(_spender, _value);

    // solium-disable-next-line security/no-call-value
    (bool success, ) = _spender.call{value: msg.value}(_data);
    require(success);

    return true;
  }

}
