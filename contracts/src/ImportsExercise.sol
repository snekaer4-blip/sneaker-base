// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SillyStringUtils.sol";

contract ImportsExercise {
    // Import the Haiku struct from the library
    using SillyStringUtils for string;
    
    // Public instance of Haiku
    SillyStringUtils.Haiku public haiku;

    // Events for better UX and logging
    event HaikuSaved(string line1, string line2, string line3);
    event HaikuShruggie(string originalLine3, string shruggieVersion);

    // Save three strings as lines of haiku
    function saveHaiku(string memory _line1, string memory _line2, string memory _line3) public {
        haiku.line1 = _line1;
        haiku.line2 = _line2;
        haiku.line3 = _line3;
        
        emit HaikuSaved(_line1, _line2, _line3);
    }

    // Return the haiku as a Haiku type (not individual members like auto-generated getter)
    function getHaiku() public view returns (SillyStringUtils.Haiku memory) {
        return haiku;
    }

    // Use library to add 🤷 to line3 without modifying original
    function shruggieHaiku() public view returns (SillyStringUtils.Haiku memory) {
        // Create a copy of the haiku to avoid modifying the original
        SillyStringUtils.Haiku memory modifiedHaiku = SillyStringUtils.Haiku({
            line1: haiku.line1,
            line2: haiku.line2,
            line3: SillyStringUtils.shruggie(haiku.line3)
        });
        
        return modifiedHaiku;
    }

    // Utility functions for better UX and testing

    // Check if haiku is empty
    function isHaikuEmpty() public view returns (bool) {
        return (
            bytes(haiku.line1).length == 0 &&
            bytes(haiku.line2).length == 0 &&
            bytes(haiku.line3).length == 0
        );
    }

    // Get individual lines (alternative to auto-generated getters)
    function getLine1() public view returns (string memory) {
        return haiku.line1;
    }

    function getLine2() public view returns (string memory) {
        return haiku.line2;
    }

    function getLine3() public view returns (string memory) {
        return haiku.line3;
    }

    // Clear the haiku
    function clearHaiku() public {
        delete haiku;
    }

    // Get haiku lines as separate strings (for UI convenience)
    function getHaikuLines() public view returns (string memory, string memory, string memory) {
        return (haiku.line1, haiku.line2, haiku.line3);
    }

    // Apply shruggie to any string using the library (demonstration)
    function applyShruggie(string memory _input) public pure returns (string memory) {
        return SillyStringUtils.shruggie(_input);
    }

    // Count total characters in haiku
    function getHaikuLength() public view returns (uint256) {
        return bytes(haiku.line1).length + bytes(haiku.line2).length + bytes(haiku.line3).length;
    }

    // Create a formatted haiku string with line breaks
    function getFormattedHaiku() public view returns (string memory) {
        return string.concat(
            haiku.line1,
            "\n",
            haiku.line2, 
            "\n",
            haiku.line3
        );
    }

    // Create a shruggie version of the entire haiku (all lines get 🤷)
    function getFullShruggieHaiku() public view returns (SillyStringUtils.Haiku memory) {
        return SillyStringUtils.Haiku({
            line1: SillyStringUtils.shruggie(haiku.line1),
            line2: SillyStringUtils.shruggie(haiku.line2),
            line3: SillyStringUtils.shruggie(haiku.line3)
        });
    }

    // Compare two haikus for equality
    function compareHaiku(SillyStringUtils.Haiku memory _other) public view returns (bool) {
        return (
            keccak256(abi.encodePacked(haiku.line1)) == keccak256(abi.encodePacked(_other.line1)) &&
            keccak256(abi.encodePacked(haiku.line2)) == keccak256(abi.encodePacked(_other.line2)) &&
            keccak256(abi.encodePacked(haiku.line3)) == keccak256(abi.encodePacked(_other.line3))
        );
    }

    // Constructor to optionally initialize with a haiku
    constructor() {
        // Start with an empty haiku
    }

    // Alternative constructor-like function to initialize with data
    function initializeHaiku(string memory _line1, string memory _line2, string memory _line3) public {
        saveHaiku(_line1, _line2, _line3);
    }
}
