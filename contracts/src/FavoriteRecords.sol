// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FavoriteRecords {
    // Custom error for unapproved records
    error NotApproved(string albumName);

    // Public mapping to check if a record is approved
    mapping(string => bool) public approvedRecords;
    
    // Nested mapping: user address => album name => is favorite
    mapping(address => mapping(string => bool)) public userFavorites;
    
    // Array to keep track of approved record names for enumeration
    string[] private approvedRecordsList;
    
    // Mapping to track user's favorite records for efficient retrieval
    mapping(address => string[]) private userFavoritesList;

    constructor() {
        // Load approved records
        _addApprovedRecord("Thriller");
        _addApprovedRecord("Back in Black");
        _addApprovedRecord("The Bodyguard");
        _addApprovedRecord("The Dark Side of the Moon");
        _addApprovedRecord("Their Greatest Hits (1971-1975)");
        _addApprovedRecord("Hotel California");
        _addApprovedRecord("Come On Over");
        _addApprovedRecord("Rumours");
        _addApprovedRecord("Saturday Night Fever");
    }

    // Internal function to add approved records
    function _addApprovedRecord(string memory _albumName) internal {
        approvedRecords[_albumName] = true;
        approvedRecordsList.push(_albumName);
    }

    // Get all approved records
    function getApprovedRecords() public view returns (string[] memory) {
        return approvedRecordsList;
    }

    // Add a record to user's favorites
    function addRecord(string memory _albumName) public {
        // Check if the album is approved
        if (!approvedRecords[_albumName]) {
            revert NotApproved(_albumName);
        }
        
        // Check if user already has this record as favorite
        if (!userFavorites[msg.sender][_albumName]) {
            userFavorites[msg.sender][_albumName] = true;
            userFavoritesList[msg.sender].push(_albumName);
        }
    }

    // Get user's favorite records
    function getUserFavorites(address _user) public view returns (string[] memory) {
        return userFavoritesList[_user];
    }

    // Reset user's favorites
    function resetUserFavorites() public {
        string[] memory currentFavorites = userFavoritesList[msg.sender];
        
        // Reset the mapping for each favorite
        for (uint i = 0; i < currentFavorites.length; i++) {
            userFavorites[msg.sender][currentFavorites[i]] = false;
        }
        
        // Clear the favorites list
        delete userFavoritesList[msg.sender];
    }

    // Utility functions for better UX and testing

    // Check if a specific album is in user's favorites
    function isUserFavorite(address _user, string memory _albumName) public view returns (bool) {
        return userFavorites[_user][_albumName];
    }

    // Get the count of user's favorites
    function getUserFavoritesCount(address _user) public view returns (uint) {
        return userFavoritesList[_user].length;
    }

    // Get the count of approved records
    function getApprovedRecordsCount() public view returns (uint) {
        return approvedRecordsList.length;
    }

    // Check if a record exists in approved list (alternative to public mapping)
    function isApprovedRecord(string memory _albumName) public view returns (bool) {
        return approvedRecords[_albumName];
    }

    // Remove a record from user's favorites
    function removeRecord(string memory _albumName) public {
        if (userFavorites[msg.sender][_albumName]) {
            userFavorites[msg.sender][_albumName] = false;
            
            // Remove from the favorites list array
            string[] storage favorites = userFavoritesList[msg.sender];
            for (uint i = 0; i < favorites.length; i++) {
                if (keccak256(abi.encodePacked(favorites[i])) == keccak256(abi.encodePacked(_albumName))) {
                    favorites[i] = favorites[favorites.length - 1];
                    favorites.pop();
                    break;
                }
            }
        }
    }
}
