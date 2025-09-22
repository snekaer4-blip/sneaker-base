// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {FavoriteRecords} from "../src/FavoriteRecords.sol";

contract FavoriteRecordsTest is Test {
    FavoriteRecords public favoriteRecords;
    
    // Test addresses
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    // Expected approved records
    string[] expectedApprovedRecords = [
        "Thriller",
        "Back in Black",
        "The Bodyguard",
        "The Dark Side of the Moon",
        "Their Greatest Hits (1971-1975)",
        "Hotel California",
        "Come On Over",
        "Rumours",
        "Saturday Night Fever"
    ];

    function setUp() public {
        favoriteRecords = new FavoriteRecords();
    }

    function testInitialApprovedRecords() public {
        // Test that all expected records are approved
        for (uint i = 0; i < expectedApprovedRecords.length; i++) {
            assertTrue(favoriteRecords.approvedRecords(expectedApprovedRecords[i]));
            assertTrue(favoriteRecords.isApprovedRecord(expectedApprovedRecords[i]));
        }
        
        // Test count
        assertEq(favoriteRecords.getApprovedRecordsCount(), 9);
    }

    function testGetApprovedRecords() public {
        string[] memory approvedRecords = favoriteRecords.getApprovedRecords();
        assertEq(approvedRecords.length, 9);
        
        // Check that all expected records are present
        for (uint i = 0; i < expectedApprovedRecords.length; i++) {
            bool found = false;
            for (uint j = 0; j < approvedRecords.length; j++) {
                if (keccak256(abi.encodePacked(approvedRecords[j])) == keccak256(abi.encodePacked(expectedApprovedRecords[i]))) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, string(abi.encodePacked("Record not found: ", expectedApprovedRecords[i])));
        }
    }

    function testUnapprovedRecordNotInList() public {
        // Test that unapproved records return false
        assertFalse(favoriteRecords.approvedRecords("Random Album"));
        assertFalse(favoriteRecords.isApprovedRecord("Not Approved"));
    }

    function testAddApprovedRecord() public {
        vm.prank(alice);
        favoriteRecords.addRecord("Thriller");
        
        // Check that it was added to user's favorites
        assertTrue(favoriteRecords.userFavorites(alice, "Thriller"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
        
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 1);
        assertEq(aliceFavorites[0], "Thriller");
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 1);
    }

    function testAddUnapprovedRecord() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(FavoriteRecords.NotApproved.selector, "Unknown Album"));
        favoriteRecords.addRecord("Unknown Album");
    }

    function testAddMultipleRecords() public {
        vm.startPrank(alice);
        favoriteRecords.addRecord("Thriller");
        favoriteRecords.addRecord("Back in Black");
        favoriteRecords.addRecord("Rumours");
        vm.stopPrank();
        
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 3);
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 3);
        
        // Check individual records
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Back in Black"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Rumours"));
        
        // Check that other records are not favorites
        assertFalse(favoriteRecords.isUserFavorite(alice, "Hotel California"));
    }

    function testAddDuplicateRecord() public {
        vm.startPrank(alice);
        favoriteRecords.addRecord("Thriller");
        favoriteRecords.addRecord("Thriller"); // Adding same record again
        vm.stopPrank();
        
        // Should still only have one instance
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 1);
        assertEq(aliceFavorites[0], "Thriller");
    }

    function testMultipleUsers() public {
        // Alice adds some favorites
        vm.prank(alice);
        favoriteRecords.addRecord("Thriller");
        
        vm.prank(alice);
        favoriteRecords.addRecord("Back in Black");
        
        // Bob adds different favorites
        vm.prank(bob);
        favoriteRecords.addRecord("Rumours");
        
        vm.prank(bob);
        favoriteRecords.addRecord("Hotel California");
        
        // Charlie adds one favorite
        vm.prank(charlie);
        favoriteRecords.addRecord("The Bodyguard");
        
        // Check Alice's favorites
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 2);
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Back in Black"));
        assertFalse(favoriteRecords.isUserFavorite(alice, "Rumours"));
        
        // Check Bob's favorites
        string[] memory bobFavorites = favoriteRecords.getUserFavorites(bob);
        assertEq(bobFavorites.length, 2);
        assertTrue(favoriteRecords.isUserFavorite(bob, "Rumours"));
        assertTrue(favoriteRecords.isUserFavorite(bob, "Hotel California"));
        assertFalse(favoriteRecords.isUserFavorite(bob, "Thriller"));
        
        // Check Charlie's favorites
        string[] memory charlieFavorites = favoriteRecords.getUserFavorites(charlie);
        assertEq(charlieFavorites.length, 1);
        assertTrue(favoriteRecords.isUserFavorite(charlie, "The Bodyguard"));
    }

    function testResetUserFavorites() public {
        // Add some favorites
        vm.startPrank(alice);
        favoriteRecords.addRecord("Thriller");
        favoriteRecords.addRecord("Back in Black");
        favoriteRecords.addRecord("Rumours");
        vm.stopPrank();
        
        // Verify they were added
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 3);
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
        
        // Reset favorites
        vm.prank(alice);
        favoriteRecords.resetUserFavorites();
        
        // Verify reset
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 0);
        assertFalse(favoriteRecords.isUserFavorite(alice, "Thriller"));
        assertFalse(favoriteRecords.isUserFavorite(alice, "Back in Black"));
        assertFalse(favoriteRecords.isUserFavorite(alice, "Rumours"));
        
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 0);
    }

    function testResetDoesNotAffectOtherUsers() public {
        // Alice and Bob add favorites
        vm.prank(alice);
        favoriteRecords.addRecord("Thriller");
        
        vm.prank(bob);
        favoriteRecords.addRecord("Back in Black");
        
        // Alice resets her favorites
        vm.prank(alice);
        favoriteRecords.resetUserFavorites();
        
        // Alice's favorites should be empty
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 0);
        
        // Bob's favorites should remain
        assertEq(favoriteRecords.getUserFavoritesCount(bob), 1);
        assertTrue(favoriteRecords.isUserFavorite(bob, "Back in Black"));
    }

    function testRemoveRecord() public {
        // Add some favorites
        vm.startPrank(alice);
        favoriteRecords.addRecord("Thriller");
        favoriteRecords.addRecord("Back in Black");
        favoriteRecords.addRecord("Rumours");
        vm.stopPrank();
        
        // Verify initial state
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 3);
        assertTrue(favoriteRecords.isUserFavorite(alice, "Back in Black"));
        
        // Remove one record
        vm.prank(alice);
        favoriteRecords.removeRecord("Back in Black");
        
        // Verify removal
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 2);
        assertFalse(favoriteRecords.isUserFavorite(alice, "Back in Black"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
        assertTrue(favoriteRecords.isUserFavorite(alice, "Rumours"));
        
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites.length, 2);
        
        // Verify "Back in Black" is not in the list
        for (uint i = 0; i < aliceFavorites.length; i++) {
            assertTrue(keccak256(abi.encodePacked(aliceFavorites[i])) != keccak256(abi.encodePacked("Back in Black")));
        }
    }

    function testRemoveNonExistentRecord() public {
        // Add one favorite
        vm.prank(alice);
        favoriteRecords.addRecord("Thriller");
        
        // Try to remove a record that's not in favorites
        vm.prank(alice);
        favoriteRecords.removeRecord("Back in Black");
        
        // Should have no effect
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 1);
        assertTrue(favoriteRecords.isUserFavorite(alice, "Thriller"));
    }

    function testEmptyUserFavorites() public {
        // Test user with no favorites
        string[] memory emptyFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(emptyFavorites.length, 0);
        assertEq(favoriteRecords.getUserFavoritesCount(alice), 0);
        assertFalse(favoriteRecords.isUserFavorite(alice, "Thriller"));
    }

    function testAllApprovedRecordsCanBeAdded() public {
        // Test that all approved records can be added as favorites
        string[] memory approvedRecords = favoriteRecords.getApprovedRecords();
        
        vm.startPrank(alice);
        for (uint i = 0; i < approvedRecords.length; i++) {
            favoriteRecords.addRecord(approvedRecords[i]);
        }
        vm.stopPrank();
        
        // Check that all were added
        assertEq(favoriteRecords.getUserFavoritesCount(alice), approvedRecords.length);
        
        for (uint i = 0; i < approvedRecords.length; i++) {
            assertTrue(favoriteRecords.isUserFavorite(alice, approvedRecords[i]));
        }
    }

    function testStringComparisonEdgeCases() public {
        // Test with album names that have special characters or spacing
        vm.prank(alice);
        favoriteRecords.addRecord("Their Greatest Hits (1971-1975)");
        
        assertTrue(favoriteRecords.isUserFavorite(alice, "Their Greatest Hits (1971-1975)"));
        
        string[] memory aliceFavorites = favoriteRecords.getUserFavorites(alice);
        assertEq(aliceFavorites[0], "Their Greatest Hits (1971-1975)");
    }
}
