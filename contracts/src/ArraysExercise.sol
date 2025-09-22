// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ArraysExercise {
    uint[] public numbers = [1,2,3,4,5,6,7,8,9,10];
    address[] public senders;
    uint[] public timestamps;

    // Unix timestamp for January 1, 2000, 12:00am
    uint constant Y2K_TIMESTAMP = 946702800;

    // Return the complete numbers array
    function getNumbers() public view returns (uint[] memory) {
        return numbers;
    }

    // Reset numbers array to initial values (1-10)
    // More gas-efficient implementation without using push()
    function resetNumbers() public {
        // Delete the array and reinitialize
        delete numbers;
        numbers = [1,2,3,4,5,6,7,8,9,10];
    }

    // Append an array to the existing numbers array
    function appendToNumbers(uint[] calldata _toAppend) public {
        for (uint i = 0; i < _toAppend.length; i++) {
            numbers.push(_toAppend[i]);
        }
    }

    // Save timestamp and sender address
    function saveTimestamp(uint _unixTimestamp) public {
        senders.push(msg.sender);
        timestamps.push(_unixTimestamp);
    }

    // Filter timestamps after Y2K (946702800) and return corresponding senders
    function afterY2K() public view returns (uint[] memory recentTimestamps, address[] memory recentSenders) {
        // First pass: count how many timestamps are after Y2K
        uint count = 0;
        for (uint i = 0; i < timestamps.length; i++) {
            if (timestamps[i] > Y2K_TIMESTAMP) {
                count++;
            }
        }

        // Initialize arrays with the correct size
        recentTimestamps = new uint[](count);
        recentSenders = new address[](count);

        // Second pass: populate the arrays
        uint index = 0;
        for (uint i = 0; i < timestamps.length; i++) {
            if (timestamps[i] > Y2K_TIMESTAMP) {
                recentTimestamps[index] = timestamps[i];
                recentSenders[index] = senders[i];
                index++;
            }
        }

        return (recentTimestamps, recentSenders);
    }

    // Reset senders array
    function resetSenders() public {
        delete senders;
    }

    // Reset timestamps array
    function resetTimestamps() public {
        delete timestamps;
    }

    // Utility functions for testing and UI

    // Get senders array
    function getSenders() public view returns (address[] memory) {
        return senders;
    }

    // Get timestamps array
    function getTimestamps() public view returns (uint[] memory) {
        return timestamps;
    }

    // Get the length of arrays for UI purposes
    function getNumbersLength() public view returns (uint) {
        return numbers.length;
    }

    function getSendersLength() public view returns (uint) {
        return senders.length;
    }

    function getTimestampsLength() public view returns (uint) {
        return timestamps.length;
    }
}
