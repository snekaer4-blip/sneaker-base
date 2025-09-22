// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {ArraysExercise} from "../src/ArraysExercise.sol";

contract ArraysExerciseTest is Test {
    ArraysExercise public arraysExercise;
    
    // Test addresses
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    // Test timestamps
    uint constant Y2K_TIMESTAMP = 946702800; // January 1, 2000, 12:00am
    uint beforeY2K = 946702799; // 1 second before Y2K
    uint afterY2K1 = 946702801; // 1 second after Y2K
    uint afterY2K2 = 1640995200; // January 1, 2022
    uint afterY2K3 = 1672531200; // January 1, 2023

    function setUp() public {
        arraysExercise = new ArraysExercise();
    }

    function testInitialNumbersArray() public {
        // Test initial numbers array is [1,2,3,4,5,6,7,8,9,10]
        uint[] memory numbers = arraysExercise.getNumbers();
        assertEq(numbers.length, 10);
        
        for (uint i = 0; i < 10; i++) {
            assertEq(numbers[i], i + 1);
            // Also test individual getter
            assertEq(arraysExercise.numbers(i), i + 1);
        }
    }

    function testGetNumbers() public {
        // Test getNumbers returns the complete array
        uint[] memory numbers = arraysExercise.getNumbers();
        assertEq(numbers.length, 10);
        assertEq(numbers[0], 1);
        assertEq(numbers[9], 10);
    }

    function testResetNumbers() public {
        // First, modify the array
        uint[] memory toAppend = new uint[](3);
        toAppend[0] = 11;
        toAppend[1] = 12;
        toAppend[2] = 13;
        arraysExercise.appendToNumbers(toAppend);
        
        // Verify it was modified
        uint[] memory modifiedNumbers = arraysExercise.getNumbers();
        assertEq(modifiedNumbers.length, 13);
        
        // Reset and verify
        arraysExercise.resetNumbers();
        uint[] memory resetNumbers = arraysExercise.getNumbers();
        assertEq(resetNumbers.length, 10);
        
        for (uint i = 0; i < 10; i++) {
            assertEq(resetNumbers[i], i + 1);
        }
    }

    function testAppendToNumbers() public {
        // Test appending to numbers array
        uint[] memory toAppend = new uint[](3);
        toAppend[0] = 11;
        toAppend[1] = 12;
        toAppend[2] = 13;
        
        arraysExercise.appendToNumbers(toAppend);
        
        uint[] memory numbers = arraysExercise.getNumbers();
        assertEq(numbers.length, 13);
        assertEq(numbers[10], 11);
        assertEq(numbers[11], 12);
        assertEq(numbers[12], 13);
    }

    function testAppendEmptyArray() public {
        // Test appending empty array
        uint[] memory emptyArray = new uint[](0);
        arraysExercise.appendToNumbers(emptyArray);
        
        uint[] memory numbers = arraysExercise.getNumbers();
        assertEq(numbers.length, 10); // Should remain unchanged
    }

    function testSaveTimestamp() public {
        // Test saving timestamp with different senders
        vm.prank(alice);
        arraysExercise.saveTimestamp(afterY2K1);
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K2);
        
        vm.prank(charlie);
        arraysExercise.saveTimestamp(beforeY2K);
        
        // Verify arrays
        address[] memory senders = arraysExercise.getSenders();
        uint[] memory timestamps = arraysExercise.getTimestamps();
        
        assertEq(senders.length, 3);
        assertEq(timestamps.length, 3);
        
        assertEq(senders[0], alice);
        assertEq(senders[1], bob);
        assertEq(senders[2], charlie);
        
        assertEq(timestamps[0], afterY2K1);
        assertEq(timestamps[1], afterY2K2);
        assertEq(timestamps[2], beforeY2K);
    }

    function testAfterY2K() public {
        // Setup test data
        vm.prank(alice);
        arraysExercise.saveTimestamp(beforeY2K); // Should be filtered out
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K1); // Should be included
        
        vm.prank(charlie);
        arraysExercise.saveTimestamp(afterY2K2); // Should be included
        
        vm.prank(alice);
        arraysExercise.saveTimestamp(Y2K_TIMESTAMP); // Should be filtered out (not > Y2K)
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K3); // Should be included
        
        // Call afterY2K
        (uint[] memory recentTimestamps, address[] memory recentSenders) = arraysExercise.afterY2K();
        
        // Verify results
        assertEq(recentTimestamps.length, 3);
        assertEq(recentSenders.length, 3);
        
        assertEq(recentTimestamps[0], afterY2K1);
        assertEq(recentSenders[0], bob);
        
        assertEq(recentTimestamps[1], afterY2K2);
        assertEq(recentSenders[1], charlie);
        
        assertEq(recentTimestamps[2], afterY2K3);
        assertEq(recentSenders[2], bob);
    }

    function testAfterY2KEmptyResult() public {
        // Test when no timestamps are after Y2K
        vm.prank(alice);
        arraysExercise.saveTimestamp(beforeY2K);
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(Y2K_TIMESTAMP); // Exactly Y2K, not >
        
        (uint[] memory recentTimestamps, address[] memory recentSenders) = arraysExercise.afterY2K();
        
        assertEq(recentTimestamps.length, 0);
        assertEq(recentSenders.length, 0);
    }

    function testResetSenders() public {
        // Add some data
        vm.prank(alice);
        arraysExercise.saveTimestamp(afterY2K1);
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K2);
        
        // Verify data exists
        assertEq(arraysExercise.getSendersLength(), 2);
        
        // Reset senders
        arraysExercise.resetSenders();
        
        // Verify reset
        assertEq(arraysExercise.getSendersLength(), 0);
        address[] memory senders = arraysExercise.getSenders();
        assertEq(senders.length, 0);
        
        // Timestamps should remain (they're separate)
        assertEq(arraysExercise.getTimestampsLength(), 2);
    }

    function testResetTimestamps() public {
        // Add some data
        vm.prank(alice);
        arraysExercise.saveTimestamp(afterY2K1);
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K2);
        
        // Verify data exists
        assertEq(arraysExercise.getTimestampsLength(), 2);
        
        // Reset timestamps
        arraysExercise.resetTimestamps();
        
        // Verify reset
        assertEq(arraysExercise.getTimestampsLength(), 0);
        uint[] memory timestamps = arraysExercise.getTimestamps();
        assertEq(timestamps.length, 0);
        
        // Senders should remain (they're separate)
        assertEq(arraysExercise.getSendersLength(), 2);
    }

    function testArrayLengthFunctions() public {
        // Test initial lengths
        assertEq(arraysExercise.getNumbersLength(), 10);
        assertEq(arraysExercise.getSendersLength(), 0);
        assertEq(arraysExercise.getTimestampsLength(), 0);
        
        // Add some data
        uint[] memory toAppend = new uint[](2);
        toAppend[0] = 11;
        toAppend[1] = 12;
        arraysExercise.appendToNumbers(toAppend);
        
        vm.prank(alice);
        arraysExercise.saveTimestamp(afterY2K1);
        
        // Test updated lengths
        assertEq(arraysExercise.getNumbersLength(), 12);
        assertEq(arraysExercise.getSendersLength(), 1);
        assertEq(arraysExercise.getTimestampsLength(), 1);
    }

    function testIndividualArrayAccess() public {
        // Test that individual array elements can be accessed
        for (uint i = 0; i < 10; i++) {
            assertEq(arraysExercise.numbers(i), i + 1);
        }
        
        // Add timestamp data and test individual access
        vm.prank(alice);
        arraysExercise.saveTimestamp(afterY2K1);
        
        assertEq(arraysExercise.senders(0), alice);
        assertEq(arraysExercise.timestamps(0), afterY2K1);
    }

    function testComplexScenario() public {
        // Complex test combining multiple operations
        
        // 1. Append to numbers
        uint[] memory toAppend = new uint[](2);
        toAppend[0] = 100;
        toAppend[1] = 200;
        arraysExercise.appendToNumbers(toAppend);
        
        // 2. Add various timestamps
        vm.prank(alice);
        arraysExercise.saveTimestamp(beforeY2K);
        
        vm.prank(bob);
        arraysExercise.saveTimestamp(afterY2K1);
        
        vm.prank(charlie);
        arraysExercise.saveTimestamp(afterY2K2);
        
        // 3. Check state
        assertEq(arraysExercise.getNumbersLength(), 12);
        assertEq(arraysExercise.getSendersLength(), 3);
        assertEq(arraysExercise.getTimestampsLength(), 3);
        
        // 4. Filter after Y2K
        (uint[] memory recentTimestamps, address[] memory recentSenders) = arraysExercise.afterY2K();
        assertEq(recentTimestamps.length, 2);
        assertEq(recentSenders.length, 2);
        
        // 5. Reset numbers
        arraysExercise.resetNumbers();
        assertEq(arraysExercise.getNumbersLength(), 10);
        
        // 6. Timestamps should still exist
        assertEq(arraysExercise.getSendersLength(), 3);
        assertEq(arraysExercise.getTimestampsLength(), 3);
        
        // 7. Reset timestamp arrays
        arraysExercise.resetSenders();
        arraysExercise.resetTimestamps();
        assertEq(arraysExercise.getSendersLength(), 0);
        assertEq(arraysExercise.getTimestampsLength(), 0);
    }
}
