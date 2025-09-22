// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {ControlStructures} from "../src/ControlStructures.sol";

contract ControlStructuresTest is Test {
    ControlStructures public controlStructures;

    function setUp() public {
        controlStructures = new ControlStructures();
    }

    // FizzBuzz Tests
    function testFizzBuzzFizz() public {
        // Test numbers divisible by 3 but not 5
        assertEq(controlStructures.fizzBuzz(3), "Fizz");
        assertEq(controlStructures.fizzBuzz(6), "Fizz");
        assertEq(controlStructures.fizzBuzz(9), "Fizz");
        assertEq(controlStructures.fizzBuzz(12), "Fizz");
    }

    function testFizzBuzzBuzz() public {
        // Test numbers divisible by 5 but not 3
        assertEq(controlStructures.fizzBuzz(5), "Buzz");
        assertEq(controlStructures.fizzBuzz(10), "Buzz");
        assertEq(controlStructures.fizzBuzz(20), "Buzz");
        assertEq(controlStructures.fizzBuzz(25), "Buzz");
    }

    function testFizzBuzzFizzBuzz() public {
        // Test numbers divisible by both 3 and 5
        assertEq(controlStructures.fizzBuzz(15), "FizzBuzz");
        assertEq(controlStructures.fizzBuzz(30), "FizzBuzz");
        assertEq(controlStructures.fizzBuzz(45), "FizzBuzz");
        assertEq(controlStructures.fizzBuzz(60), "FizzBuzz");
    }

    function testFizzBuzzSplat() public {
        // Test numbers not divisible by 3 or 5
        assertEq(controlStructures.fizzBuzz(1), "Splat");
        assertEq(controlStructures.fizzBuzz(2), "Splat");
        assertEq(controlStructures.fizzBuzz(4), "Splat");
        assertEq(controlStructures.fizzBuzz(7), "Splat");
        assertEq(controlStructures.fizzBuzz(8), "Splat");
        assertEq(controlStructures.fizzBuzz(11), "Splat");
    }

    // DoNotDisturb Tests
    function testDoNotDisturbPanic() public {
        // Test panic for times >= 2400
        vm.expectRevert(abi.encodeWithSignature("Panic(uint256)", 1));
        controlStructures.doNotDisturb(2400);
        
        vm.expectRevert(abi.encodeWithSignature("Panic(uint256)", 1));
        controlStructures.doNotDisturb(2500);
    }

    function testDoNotDisturbAfterHours() public {
        // Test custom error for times > 2200 or < 800
        vm.expectRevert(abi.encodeWithSelector(ControlStructures.AfterHours.selector, 2300));
        controlStructures.doNotDisturb(2300);
        
        vm.expectRevert(abi.encodeWithSelector(ControlStructures.AfterHours.selector, 700));
        controlStructures.doNotDisturb(700);
        
        vm.expectRevert(abi.encodeWithSelector(ControlStructures.AfterHours.selector, 2201));
        controlStructures.doNotDisturb(2201);
        
        vm.expectRevert(abi.encodeWithSelector(ControlStructures.AfterHours.selector, 799));
        controlStructures.doNotDisturb(799);
    }

    function testDoNotDisturbAtLunch() public {
        // Test string revert for lunch time (1200-1259)
        vm.expectRevert("At lunch!");
        controlStructures.doNotDisturb(1200);
        
        vm.expectRevert("At lunch!");
        controlStructures.doNotDisturb(1230);
        
        vm.expectRevert("At lunch!");
        controlStructures.doNotDisturb(1259);
    }

    function testDoNotDisturbMorning() public {
        // Test morning times (800-1199)
        assertEq(controlStructures.doNotDisturb(800), "Morning!");
        assertEq(controlStructures.doNotDisturb(900), "Morning!");
        assertEq(controlStructures.doNotDisturb(1000), "Morning!");
        assertEq(controlStructures.doNotDisturb(1100), "Morning!");
        assertEq(controlStructures.doNotDisturb(1199), "Morning!");
    }

    function testDoNotDisturbAfternoon() public {
        // Test afternoon times (1300-1799)
        assertEq(controlStructures.doNotDisturb(1300), "Afternoon!");
        assertEq(controlStructures.doNotDisturb(1400), "Afternoon!");
        assertEq(controlStructures.doNotDisturb(1500), "Afternoon!");
        assertEq(controlStructures.doNotDisturb(1600), "Afternoon!");
        assertEq(controlStructures.doNotDisturb(1700), "Afternoon!");
        assertEq(controlStructures.doNotDisturb(1799), "Afternoon!");
    }

    function testDoNotDisturbEvening() public {
        // Test evening times (1800-2200)
        assertEq(controlStructures.doNotDisturb(1800), "Evening!");
        assertEq(controlStructures.doNotDisturb(1900), "Evening!");
        assertEq(controlStructures.doNotDisturb(2000), "Evening!");
        assertEq(controlStructures.doNotDisturb(2100), "Evening!");
        assertEq(controlStructures.doNotDisturb(2200), "Evening!");
    }
}
