// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HaikuNFT} from "../src/HaikuNFT.sol";

contract HaikuNFTTest is Test {
    HaikuNFT public haikuNFT;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    function setUp() public {
        haikuNFT = new HaikuNFT();
    }

    function testInitialState() public {
        assertEq(haikuNFT.name(), "HaikuNFT");
        assertEq(haikuNFT.symbol(), "HAIKU");
        assertEq(haikuNFT.counter(), 1);
        assertEq(haikuNFT.getTotalHaikus(), 0);
    }

    function testMintHaiku() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Cherry blossoms fall",
            "Petals dance on gentle breeze",
            "Spring's fleeting beauty"
        );
        
        assertEq(haikuNFT.counter(), 2);
        assertEq(haikuNFT.getTotalHaikus(), 1);
        assertEq(haikuNFT.ownerOf(1), user1);
        assertEq(haikuNFT.balanceOf(user1), 1);
        
        HaikuNFT.Haiku memory haiku = haikuNFT.getHaiku(1);
        assertEq(haiku.author, user1);
        assertEq(haiku.line1, "Cherry blossoms fall");
        assertEq(haiku.line2, "Petals dance on gentle breeze");
        assertEq(haiku.line3, "Spring's fleeting beauty");
    }

    function testMintMultipleHaikus() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Morning dew glistens",
            "On grass blades silver and bright",
            "Dawn breaks the silence"
        );
        
        vm.prank(user2);
        haikuNFT.mintHaiku(
            "Ocean waves crash down",
            "Salt spray kisses weathered rocks",
            "Eternal rhythm"
        );
        
        assertEq(haikuNFT.counter(), 3);
        assertEq(haikuNFT.getTotalHaikus(), 2);
        assertEq(haikuNFT.ownerOf(1), user1);
        assertEq(haikuNFT.ownerOf(2), user2);
    }

    function testDuplicateLineReverts() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Cherry blossoms fall",
            "Petals dance on gentle breeze",
            "Spring's fleeting beauty"
        );
        
        // Try to use the same first line
        vm.prank(user2);
        vm.expectRevert(HaikuNFT.HaikuNotUnique.selector);
        haikuNFT.mintHaiku(
            "Cherry blossoms fall",  // Same as above
            "Different second line",
            "Different third line"
        );
    }

    function testDuplicateLineRevertsMiddle() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "First unique line",
            "Second unique line",
            "Third unique line"
        );
        
        // Try to use the same middle line
        vm.prank(user2);
        vm.expectRevert(HaikuNFT.HaikuNotUnique.selector);
        haikuNFT.mintHaiku(
            "Different first line",
            "Second unique line",  // Same as above
            "Different third line"
        );
    }

    function testDuplicateLineRevertsLast() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Another first line",
            "Another second line",
            "Another third line"
        );
        
        // Try to use the same last line
        vm.prank(user2);
        vm.expectRevert(HaikuNFT.HaikuNotUnique.selector);
        haikuNFT.mintHaiku(
            "New first line",
            "New second line",
            "Another third line"  // Same as above
        );
    }

    function testCaseInsensitiveDuplicate() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Cherry Blossoms Fall",
            "Petals Dance Gently",
            "Spring Beauty Fades"
        );
        
        // Try to use the same line with different case
        vm.prank(user2);
        vm.expectRevert(HaikuNFT.HaikuNotUnique.selector);
        haikuNFT.mintHaiku(
            "cherry blossoms fall",  // Same but lowercase
            "Different second line",
            "Different third line"
        );
    }

    function testShareHaiku() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Autumn leaves falling",
            "Golden carpet on the ground", 
            "Nature's masterpiece"
        );
        
        vm.prank(user1);
        haikuNFT.shareHaiku(user2, 1);
        
        uint256[] memory sharedIds = haikuNFT.getSharedHaikuIds(user2);
        assertEq(sharedIds.length, 1);
        assertEq(sharedIds[0], 1);
        
        vm.prank(user2);
        HaikuNFT.Haiku[] memory sharedHaikus = haikuNFT.getMySharedHaikus();
        assertEq(sharedHaikus.length, 1);
        assertEq(sharedHaikus[0].line1, "Autumn leaves falling");
    }

    function testShareHaikuNotOwner() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Mountain peak stands tall",
            "Snow-capped against azure sky",
            "Timeless and serene"
        );
        
        vm.prank(user2);  // user2 doesn't own the haiku
        vm.expectRevert(abi.encodeWithSelector(HaikuNFT.NotYourHaiku.selector, 1));
        haikuNFT.shareHaiku(user3, 1);
    }

    function testGetMySharedHaikusEmpty() public {
        vm.prank(user1);
        vm.expectRevert(HaikuNFT.NoHaikusShared.selector);
        haikuNFT.getMySharedHaikus();
    }

    function testMultipleSharedHaikus() public {
        // Mint multiple haikus
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "First haiku line one",
            "First haiku line two here",
            "First haiku line three"
        );
        
        vm.prank(user2);
        haikuNFT.mintHaiku(
            "Second haiku line one",
            "Second haiku line two here",
            "Second haiku line three"
        );
        
        // Share both with user3
        vm.prank(user1);
        haikuNFT.shareHaiku(user3, 1);
        
        vm.prank(user2);
        haikuNFT.shareHaiku(user3, 2);
        
        vm.prank(user3);
        HaikuNFT.Haiku[] memory sharedHaikus = haikuNFT.getMySharedHaikus();
        assertEq(sharedHaikus.length, 2);
        assertEq(sharedHaikus[0].line1, "First haiku line one");
        assertEq(sharedHaikus[1].line1, "Second haiku line one");
    }

    function testGetHaikusByAuthor() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "User one first haiku",
            "Line two of first poem",
            "Line three completes it"
        );
        
        vm.prank(user2);
        haikuNFT.mintHaiku(
            "User two writes here",
            "Their creative expression",
            "In seventeen sounds"
        );
        
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "User one second poem",
            "Another creative work",
            "From the same author"
        );
        
        HaikuNFT.Haiku[] memory user1Haikus = haikuNFT.getHaikusByAuthor(user1);
        assertEq(user1Haikus.length, 2);
        assertEq(user1Haikus[0].line1, "User one first haiku");
        assertEq(user1Haikus[1].line1, "User one second poem");
        
        HaikuNFT.Haiku[] memory user2Haikus = haikuNFT.getHaikusByAuthor(user2);
        assertEq(user2Haikus.length, 1);
        assertEq(user2Haikus[0].line1, "User two writes here");
    }

    function testGetHaikuInvalidId() public {
        vm.expectRevert("Invalid haiku ID");
        haikuNFT.getHaiku(999);
        
        vm.expectRevert("Invalid haiku ID");
        haikuNFT.getHaiku(0);
    }

    function testTokenURI() public {
        vm.prank(user1);
        haikuNFT.mintHaiku(
            "Code compiles today",
            "Smart contracts deployed on chain",
            "Blockchain poetry"
        );
        
        string memory uri = haikuNFT.tokenURI(1);
        // Just check that it doesn't revert and returns something
        assertTrue(bytes(uri).length > 0);
    }

    function testCounterProgression() public {
        assertEq(haikuNFT.counter(), 1);
        
        vm.prank(user1);
        haikuNFT.mintHaiku("Line A", "Line B", "Line C");
        assertEq(haikuNFT.counter(), 2);
        
        vm.prank(user2);
        haikuNFT.mintHaiku("Line D", "Line E", "Line F");
        assertEq(haikuNFT.counter(), 3);
        
        vm.prank(user3);
        haikuNFT.mintHaiku("Line G", "Line H", "Line I");
        assertEq(haikuNFT.counter(), 4);
        
        // Check that the 10th haiku would have counter at 11
        // (as specified in the requirements)
        for (uint256 i = 0; i < 7; i++) {
            vm.prank(user1);
            haikuNFT.mintHaiku(
                string(abi.encodePacked("Line ", i, "A")),
                string(abi.encodePacked("Line ", i, "B")), 
                string(abi.encodePacked("Line ", i, "C"))
            );
        }
        
        assertEq(haikuNFT.getTotalHaikus(), 10);
        assertEq(haikuNFT.counter(), 11);
    }
}
