// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {ErrorTriageExercise} from "../src/ErrorTriageExercise.sol";

contract ErrorTriageExerciseTest is Test {
    ErrorTriageExercise public exercise;

    function setUp() public {
        exercise = new ErrorTriageExercise();
    }

    function testDiffWithNeighbor() public {
        uint[] memory result = exercise.diffWithNeighbor(10, 5, 15, 8);
        
        assertEq(result.length, 3);
        assertEq(result[0], 5); // |10 - 5| = 5
        assertEq(result[1], 10); // |5 - 15| = 10
        assertEq(result[2], 7); // |15 - 8| = 7
    }

    function testDiffWithNeighborReverse() public {
        uint[] memory result = exercise.diffWithNeighbor(5, 10, 8, 15);
        
        assertEq(result.length, 3);
        assertEq(result[0], 5); // |5 - 10| = 5
        assertEq(result[1], 2); // |10 - 8| = 2
        assertEq(result[2], 7); // |8 - 15| = 7
    }

    function testApplyModifierPositive() public {
        uint result = exercise.applyModifier(1000, 50);
        assertEq(result, 1050);
    }

    function testApplyModifierNegative() public {
        uint result = exercise.applyModifier(1000, -50);
        assertEq(result, 950);
    }

    function testApplyModifierLargeNegative() public {
        vm.expectRevert("Modifier would cause underflow");
        exercise.applyModifier(1000, -1001);
    }

    function testPopWithReturnEmpty() public {
        vm.expectRevert("Array is empty");
        exercise.popWithReturn();
    }

    function testPopWithReturn() public {
        exercise.addToArr(42);
        exercise.addToArr(100);
        
        uint[] memory arr = exercise.getArr();
        assertEq(arr.length, 2);
        assertEq(arr[1], 100);
        
        uint popped = exercise.popWithReturn();
        assertEq(popped, 100);
        
        arr = exercise.getArr();
        assertEq(arr.length, 1);
        assertEq(arr[0], 42);
    }

    function testArrayUtilities() public {
        // Test adding elements
        exercise.addToArr(1);
        exercise.addToArr(2);
        exercise.addToArr(3);
        
        uint[] memory arr = exercise.getArr();
        assertEq(arr.length, 3);
        assertEq(arr[0], 1);
        assertEq(arr[1], 2);
        assertEq(arr[2], 3);
        
        // Test reset
        exercise.resetArr();
        arr = exercise.getArr();
        assertEq(arr.length, 0);
    }
}
