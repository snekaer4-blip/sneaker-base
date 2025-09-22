// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressBook is Ownable {
    // Custom error for when a contact is not found
    error ContactNotFound(uint256 id);

    // Struct to represent a contact
    struct Contact {
        uint256 id;
        string firstName;
        string lastName;
        uint256[] phoneNumbers;
    }

    // Storage for contacts - mapping from id to Contact
    mapping(uint256 => Contact) private contacts;
    
    // Array to keep track of all contact IDs for iteration
    uint256[] private contactIds;
    
    // Counter for generating unique contact IDs
    uint256 private nextContactId;

    // Constructor that sets the initial owner
    constructor(address initialOwner) Ownable(initialOwner) {
        nextContactId = 1; // Start IDs from 1
    }

    /**
     * @dev Add a new contact to the address book
     * @param _firstName First name of the contact
     * @param _lastName Last name of the contact
     * @param _phoneNumbers Array of phone numbers for the contact
     * @return id The ID of the newly created contact
     */
    function addContact(
        string memory _firstName,
        string memory _lastName,
        uint256[] memory _phoneNumbers
    ) public onlyOwner returns (uint256 id) {
        id = nextContactId;
        nextContactId++;

        // Create the new contact
        contacts[id] = Contact({
            id: id,
            firstName: _firstName,
            lastName: _lastName,
            phoneNumbers: _phoneNumbers
        });

        // Add to the list of contact IDs
        contactIds.push(id);

        return id;
    }

    /**
     * @dev Delete a contact from the address book
     * @param _id The ID of the contact to delete
     */
    function deleteContact(uint256 _id) public onlyOwner {
        // Check if contact exists
        if (contacts[_id].id == 0) {
            revert ContactNotFound(_id);
        }

        // Delete the contact
        delete contacts[_id];

        // Remove from contactIds array
        for (uint256 i = 0; i < contactIds.length; i++) {
            if (contactIds[i] == _id) {
                // Move the last element to this position and remove the last element
                contactIds[i] = contactIds[contactIds.length - 1];
                contactIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Get contact information by ID
     * @param _id The ID of the contact to retrieve
     * @return contact The contact information
     */
    function getContact(uint256 _id) public view returns (Contact memory contact) {
        contact = contacts[_id];
        if (contact.id == 0) {
            revert ContactNotFound(_id);
        }
        return contact;
    }

    /**
     * @dev Get all contacts in the address book
     * @return allContacts Array of all non-deleted contacts
     */
    function getAllContacts() public view returns (Contact[] memory allContacts) {
        // Create array to hold all valid contacts
        allContacts = new Contact[](contactIds.length);
        uint256 validContactCount = 0;

        // Iterate through contact IDs and collect valid contacts
        for (uint256 i = 0; i < contactIds.length; i++) {
            uint256 contactId = contactIds[i];
            Contact memory contact = contacts[contactId];
            
            // Only include contacts that exist (id != 0)
            if (contact.id != 0) {
                allContacts[validContactCount] = contact;
                validContactCount++;
            }
        }

        // Resize array to remove empty slots
        Contact[] memory result = new Contact[](validContactCount);
        for (uint256 i = 0; i < validContactCount; i++) {
            result[i] = allContacts[i];
        }

        return result;
    }

    /**
     * @dev Get the total number of contacts
     * @return count The number of contacts in the address book
     */
    function getContactCount() public view returns (uint256 count) {
        return contactIds.length;
    }
}
