// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {BasicMath} from "../src/BasicMath.sol";

contract BasicMathTest is Test {
    BasicMath public basicMath;

    function setUp() public {
        basicMath = new BasicMath();
    }

    function testAdder() public {
        // Test normal addition
        (uint sum, bool error) = basicMath.adder(5, 3);
        assertEq(sum, 8);
        assertEq(error, false);

        // Test overflow
        (sum, error) = basicMath.adder(type(uint).max, 1);
        assertEq(sum, 0);
        assertEq(error, true);
    }

    function testSubtractor() public {
        // Test normal subtraction
        (uint difference, bool error) = basicMath.subtractor(10, 3);
        assertEq(difference, 7);
        assertEq(error, false);

        // Test underflow
        (difference, error) = basicMath.subtractor(5, 10);
        assertEq(difference, 0);
        assertEq(error, true);
    }
}
