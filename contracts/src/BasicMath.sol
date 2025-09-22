// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicMath {
    function adder(uint _a, uint _b) public pure returns (uint sum, bool error) {
        // Check for overflow using unchecked math
        unchecked {
            uint result = _a + _b;
            // If result is less than _a, overflow occurred
            if (result < _a) {
                return (0, true);
            }
            return (result, false);
        }
    }

    function subtractor(uint _a, uint _b) public pure returns (uint difference, bool error) {
        // Check for underflow
        if (_b > _a) {
            return (0, true);
        }
        return (_a - _b, false);
    }
}
