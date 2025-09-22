// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {ImportsExercise} from "../src/ImportsExercise.sol";
import {SillyStringUtils} from "../src/SillyStringUtils.sol";

contract ImportsExerciseTest is Test {
    ImportsExercise public importsExercise;

    // Sample haiku for testing
    string constant LINE1 = "Code flows like water";
    string constant LINE2 = "Smart contracts dancing free";
    string constant LINE3 = "Blockchain harmony";

    // Another test haiku
    string constant HAIKU2_LINE1 = "Solidity calls";
    string constant HAIKU2_LINE2 = "Functions execute with gas";
    string constant HAIKU2_LINE3 = "Ethereum dreams";

    function setUp() public {
        importsExercise = new ImportsExercise();
    }

    function testInitialState() public {
        // Test that haiku starts empty
        assertTrue(importsExercise.isHaikuEmpty());
        assertEq(importsExercise.getHaikuLength(), 0);
        
        // Test auto-generated getters return empty strings
        (string memory line1, string memory line2, string memory line3) = importsExercise.haiku();
        assertEq(line1, "");
        assertEq(line2, "");
        assertEq(line3, "");
        
        // Test custom getters
        assertEq(importsExercise.getLine1(), "");
        assertEq(importsExercise.getLine2(), "");
        assertEq(importsExercise.getLine3(), "");
    }

    function testSaveHaiku() public {
        // Save a haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Test that haiku is no longer empty
        assertFalse(importsExercise.isHaikuEmpty());
        
        // Test auto-generated getters
        (string memory line1, string memory line2, string memory line3) = importsExercise.haiku();
        assertEq(line1, LINE1);
        assertEq(line2, LINE2);
        assertEq(line3, LINE3);
        
        // Test custom getters
        assertEq(importsExercise.getLine1(), LINE1);
        assertEq(importsExercise.getLine2(), LINE2);
        assertEq(importsExercise.getLine3(), LINE3);
    }

    function testGetHaiku() public {
        // Save a haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Get haiku as struct
        SillyStringUtils.Haiku memory retrievedHaiku = importsExercise.getHaiku();
        
        // Verify all lines
        assertEq(retrievedHaiku.line1, LINE1);
        assertEq(retrievedHaiku.line2, LINE2);
        assertEq(retrievedHaiku.line3, LINE3);
    }

    function testGetHaikuLines() public {
        // Save a haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Get lines separately
        (string memory line1, string memory line2, string memory line3) = importsExercise.getHaikuLines();
        
        assertEq(line1, LINE1);
        assertEq(line2, LINE2);
        assertEq(line3, LINE3);
    }

    function testShruggieHaiku() public {
        // Save a haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Get shruggie version
        SillyStringUtils.Haiku memory shruggieVersion = importsExercise.shruggieHaiku();
        
        // Original should be unchanged
        SillyStringUtils.Haiku memory original = importsExercise.getHaiku();
        assertEq(original.line1, LINE1);
        assertEq(original.line2, LINE2);
        assertEq(original.line3, LINE3);
        
        // Shruggie version should have modified line3 only
        assertEq(shruggieVersion.line1, LINE1);
        assertEq(shruggieVersion.line2, LINE2);
        assertEq(shruggieVersion.line3, string.concat(LINE3, unicode" 🤷"));
    }

    function testLibraryImportAndUsage() public {
        // Test direct library usage through contract
        string memory input = "Hello world";
        string memory result = importsExercise.applyShruggie(input);
        string memory expected = string.concat(input, unicode" 🤷");
        
        assertEq(result, expected);
    }

    function testSillyStringUtilsLibraryDirectly() public {
        // Test the library function directly
        string memory input = "Testing library";
        string memory result = SillyStringUtils.shruggie(input);
        string memory expected = string.concat(input, unicode" 🤷");
        
        assertEq(result, expected);
    }

    function testHaikuLength() public {
        // Test empty haiku
        assertEq(importsExercise.getHaikuLength(), 0);
        
        // Save haiku and test length
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        uint256 expectedLength = bytes(LINE1).length + bytes(LINE2).length + bytes(LINE3).length;
        assertEq(importsExercise.getHaikuLength(), expectedLength);
    }

    function testFormattedHaiku() public {
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        string memory formatted = importsExercise.getFormattedHaiku();
        string memory expected = string.concat(LINE1, "\n", LINE2, "\n", LINE3);
        
        assertEq(formatted, expected);
    }

    function testFullShruggieHaiku() public {
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        SillyStringUtils.Haiku memory fullShruggie = importsExercise.getFullShruggieHaiku();
        
        assertEq(fullShruggie.line1, string.concat(LINE1, unicode" 🤷"));
        assertEq(fullShruggie.line2, string.concat(LINE2, unicode" 🤷"));
        assertEq(fullShruggie.line3, string.concat(LINE3, unicode" 🤷"));
        
        // Original should remain unchanged
        SillyStringUtils.Haiku memory original = importsExercise.getHaiku();
        assertEq(original.line1, LINE1);
        assertEq(original.line2, LINE2);
        assertEq(original.line3, LINE3);
    }

    function testCompareHaiku() public {
        // Save initial haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Create identical haiku for comparison
        SillyStringUtils.Haiku memory identicalHaiku = SillyStringUtils.Haiku({
            line1: LINE1,
            line2: LINE2,
            line3: LINE3
        });
        
        // Should be equal
        assertTrue(importsExercise.compareHaiku(identicalHaiku));
        
        // Create different haiku
        SillyStringUtils.Haiku memory differentHaiku = SillyStringUtils.Haiku({
            line1: HAIKU2_LINE1,
            line2: HAIKU2_LINE2,
            line3: HAIKU2_LINE3
        });
        
        // Should not be equal
        assertFalse(importsExercise.compareHaiku(differentHaiku));
    }

    function testClearHaiku() public {
        // Save haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        assertFalse(importsExercise.isHaikuEmpty());
        
        // Clear haiku
        importsExercise.clearHaiku();
        assertTrue(importsExercise.isHaikuEmpty());
        assertEq(importsExercise.getHaikuLength(), 0);
        
        // All lines should be empty
        assertEq(importsExercise.getLine1(), "");
        assertEq(importsExercise.getLine2(), "");
        assertEq(importsExercise.getLine3(), "");
    }

    function testInitializeHaiku() public {
        // Use initialize function
        importsExercise.initializeHaiku(LINE1, LINE2, LINE3);
        
        SillyStringUtils.Haiku memory haiku = importsExercise.getHaiku();
        assertEq(haiku.line1, LINE1);
        assertEq(haiku.line2, LINE2);
        assertEq(haiku.line3, LINE3);
    }

    function testOverwriteHaiku() public {
        // Save initial haiku
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        // Overwrite with new haiku
        importsExercise.saveHaiku(HAIKU2_LINE1, HAIKU2_LINE2, HAIKU2_LINE3);
        
        // Verify new haiku
        SillyStringUtils.Haiku memory haiku = importsExercise.getHaiku();
        assertEq(haiku.line1, HAIKU2_LINE1);
        assertEq(haiku.line2, HAIKU2_LINE2);
        assertEq(haiku.line3, HAIKU2_LINE3);
    }

    function testEmptyStringHandling() public {
        // Save haiku with empty strings
        importsExercise.saveHaiku("", "", "");
        
        // Should still be considered empty since all strings have zero length
        assertTrue(importsExercise.isHaikuEmpty());
        
        // And length should be 0
        assertEq(importsExercise.getHaikuLength(), 0);
        
        // But we should be able to retrieve the empty strings
        SillyStringUtils.Haiku memory haiku = importsExercise.getHaiku();
        assertEq(haiku.line1, "");
        assertEq(haiku.line2, "");
        assertEq(haiku.line3, "");
    }

    function testUnicodeHandling() public {
        string memory unicodeLine1 = unicode"🌸 Cherry blossoms fall";
        string memory unicodeLine2 = unicode"💻 Code compiles perfectly";
        string memory unicodeLine3 = unicode"⛽ Gas fees are high";
        
        importsExercise.saveHaiku(unicodeLine1, unicodeLine2, unicodeLine3);
        
        SillyStringUtils.Haiku memory haiku = importsExercise.getHaiku();
        assertEq(haiku.line1, unicodeLine1);
        assertEq(haiku.line2, unicodeLine2);
        assertEq(haiku.line3, unicodeLine3);
        
        // Test shruggie with unicode
        SillyStringUtils.Haiku memory shruggieHaiku = importsExercise.shruggieHaiku();
        assertEq(shruggieHaiku.line3, string.concat(unicodeLine3, unicode" 🤷"));
    }

    function testLibraryStructUsage() public {
        // Test that we can create Haiku structs directly
        SillyStringUtils.Haiku memory testHaiku = SillyStringUtils.Haiku({
            line1: "Direct struct creation",
            line2: "Using imported library",
            line3: "Works perfectly"
        });
        
        assertEq(testHaiku.line1, "Direct struct creation");
        assertEq(testHaiku.line2, "Using imported library");
        assertEq(testHaiku.line3, "Works perfectly");
    }

    // Define the event for testing
    event HaikuSaved(string line1, string line2, string line3);

    function testEventEmission() public {
        // Test that HaikuSaved event is emitted
        vm.expectEmit(false, false, false, true);
        emit HaikuSaved(LINE1, LINE2, LINE3);
        
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
    }

    function testGasUsage() public {
        // Test gas usage for saving haiku
        uint256 gasBefore = gasleft();
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Gas usage should be reasonable (less than 100k for saving strings)
        assertLt(gasUsed, 100000);
        
        // Test gas usage for getting haiku
        gasBefore = gasleft();
        importsExercise.getHaiku();
        gasUsed = gasBefore - gasleft();
        
        // Reading should use much less gas
        assertLt(gasUsed, 10000);
    }

    function testMultipleHaikuOperations() public {
        // Save, modify, check, clear, save again
        importsExercise.saveHaiku(LINE1, LINE2, LINE3);
        
        SillyStringUtils.Haiku memory original = importsExercise.getHaiku();
        SillyStringUtils.Haiku memory shruggie = importsExercise.shruggieHaiku();
        
        // Verify shruggie modification
        assertEq(shruggie.line3, string.concat(LINE3, unicode" 🤷"));
        
        // Clear and save new
        importsExercise.clearHaiku();
        importsExercise.saveHaiku(HAIKU2_LINE1, HAIKU2_LINE2, HAIKU2_LINE3);
        
        SillyStringUtils.Haiku memory newHaiku = importsExercise.getHaiku();
        assertEq(newHaiku.line1, HAIKU2_LINE1);
        assertEq(newHaiku.line2, HAIKU2_LINE2);
        assertEq(newHaiku.line3, HAIKU2_LINE3);
    }
}
