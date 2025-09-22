// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AddressBook.sol";

contract AddressBookFactory {
    // Event emitted when a new AddressBook is deployed
    event AddressBookDeployed(address indexed owner, address indexed addressBook);

    // Array to keep track of all deployed AddressBooks
    address[] public deployedAddressBooks;
    
    // Mapping from owner to their AddressBook addresses
    mapping(address => address[]) public ownerToAddressBooks;

    /**
     * @dev Deploy a new AddressBook contract with the caller as owner
     * @return addressBookAddress The address of the newly deployed AddressBook
     */
    function deploy() public returns (address addressBookAddress) {
        // Deploy new AddressBook with msg.sender as the initial owner
        AddressBook newAddressBook = new AddressBook(msg.sender);
        addressBookAddress = address(newAddressBook);

        // Keep track of deployed contracts
        deployedAddressBooks.push(addressBookAddress);
        ownerToAddressBooks[msg.sender].push(addressBookAddress);

        // Emit event
        emit AddressBookDeployed(msg.sender, addressBookAddress);

        return addressBookAddress;
    }

    /**
     * @dev Get all AddressBooks deployed by a specific owner
     * @param owner The owner address to query
     * @return addressBooks Array of AddressBook addresses owned by the specified address
     */
    function getAddressBooksByOwner(address owner) public view returns (address[] memory addressBooks) {
        return ownerToAddressBooks[owner];
    }

    /**
     * @dev Get all deployed AddressBooks
     * @return addressBooks Array of all deployed AddressBook addresses
     */
    function getAllDeployedAddressBooks() public view returns (address[] memory addressBooks) {
        return deployedAddressBooks;
    }

    /**
     * @dev Get the total number of deployed AddressBooks
     * @return count The total number of AddressBooks deployed through this factory
     */
    function getDeployedCount() public view returns (uint256 count) {
        return deployedAddressBooks.length;
    }
}
