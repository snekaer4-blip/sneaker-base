// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EmployeeStorage {
    // Custom error for too many shares
    error TooManyShares(uint256 totalShares);

    // Storage variables optimized for packing
    // Slot 0: shares (16 bits, 0-65535) + salary (32 bits, 0-4294967295) - both fit requirements
    uint16 private shares;     // Max 5000 shares for directors, fits in 16 bits
    uint32 private salary;     // Max 1,000,000 dollars, fits in 32 bits
    // Remaining 216 bits in slot 0 are unused but this is optimal for our constraints
    
    // Slot 1: Full 256 bits for idNumber (can be up to 2^256-1)
    uint256 public idNumber;
    
    // Slot 2+: Dynamic storage for string name
    string public name;

    constructor(uint16 _shares, string memory _name, uint32 _salary, uint256 _idNumber) {
        shares = _shares;
        name = _name;
        salary = _salary;
        idNumber = _idNumber;
    }

    function viewSalary() public view returns (uint32) {
        return salary;
    }

    function viewShares() public view returns (uint16) {
        return shares;
    }

    function grantShares(uint16 _newShares) public {
        // Check if _newShares itself is greater than 5000
        if (_newShares > 5000) {
            revert("Too many shares");
        }
        
        // Calculate new total shares
        uint256 newTotal = uint256(shares) + uint256(_newShares);
        
        // Check if new total would exceed 5000
        if (newTotal > 5000) {
            revert TooManyShares(newTotal);
        }
        
        // Safe to add shares
        shares = uint16(newTotal);
    }

    /**
    * Do not modify this function.  It is used to enable the unit test for this pin
    * to check whether or not you have configured your storage variables to make
    * use of packing.
    *
    * If you wish to cheat, simply modify this function to always return `0`
    * I'm not your boss ¯\_(ツ)_/¯
    *
    * Fair warning though, if you do cheat, it will be on the blockchain having been
    * deployed by your wallet....FOREVER!
    */
    function checkForPacking(uint _slot) public view returns (uint r) {
        assembly {
            r := sload (_slot)
        }
    }

    /**
    * Warning: Anyone can use this function at any time!
    */
    function debugResetShares() public {
        shares = 1000;
    }
}
