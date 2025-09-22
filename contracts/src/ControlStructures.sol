// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ControlStructures {
    // Custom error for doNotDisturb function
    error AfterHours(uint time);

    function fizzBuzz(uint _number) public pure returns (string memory) {
        // Check if divisible by both 3 and 5 first
        if (_number % 3 == 0 && _number % 5 == 0) {
            return "FizzBuzz";
        }
        // Check if divisible by 3
        else if (_number % 3 == 0) {
            return "Fizz";
        }
        // Check if divisible by 5
        else if (_number % 5 == 0) {
            return "Buzz";
        }
        // None of the above conditions are true
        else {
            return "Splat";
        }
    }

    function doNotDisturb(uint _time) public pure returns (string memory) {
        // If _time is greater than or equal to 2400, trigger a panic
        if (_time >= 2400) {
            assert(false); // This triggers a panic
        }
        
        // If _time is greater than 2200 or less than 800, revert with custom error
        if (_time > 2200 || _time < 800) {
            revert AfterHours(_time);
        }
        
        // If _time is between 1200 and 1259, revert with string message
        if (_time >= 1200 && _time <= 1259) {
            revert("At lunch!");
        }
        
        // If _time is between 800 and 1199, return "Morning!"
        if (_time >= 800 && _time <= 1199) {
            return "Morning!";
        }
        
        // If _time is between 1300 and 1799, return "Afternoon!"
        if (_time >= 1300 && _time <= 1799) {
            return "Afternoon!";
        }
        
        // If _time is between 1800 and 2200, return "Evening!"
        if (_time >= 1800 && _time <= 2200) {
            return "Evening!";
        }
        
        // This should never be reached due to the conditions above
        revert("Invalid time");
    }
}
