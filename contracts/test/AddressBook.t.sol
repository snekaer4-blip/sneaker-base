// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AddressBook} from "../src/AddressBook.sol";
import {AddressBookFactory} from "../src/AddressBookFactory.sol";

contract AddressBookTest is Test {
    AddressBook public addressBook;
    AddressBookFactory public factory;
    address public owner = address(0x1);
    address public nonOwner = address(0x2);

    function setUp() public {
        factory = new AddressBookFactory();
        
        // Deploy AddressBook with owner as the initial owner
        vm.prank(owner);
        address deployedAddress = factory.deploy();
        addressBook = AddressBook(deployedAddress);
    }

    function testAddContact() public {
        uint256[] memory phoneNumbers = new uint256[](2);
        phoneNumbers[0] = 1234567890;
        phoneNumbers[1] = 9876543210;

        vm.prank(owner);
        uint256 contactId = addressBook.addContact("John", "Doe", phoneNumbers);
        
        assertEq(contactId, 1);
        
        AddressBook.Contact memory contact = addressBook.getContact(contactId);
        assertEq(contact.id, 1);
        assertEq(contact.firstName, "John");
        assertEq(contact.lastName, "Doe");
        assertEq(contact.phoneNumbers.length, 2);
        assertEq(contact.phoneNumbers[0], 1234567890);
        assertEq(contact.phoneNumbers[1], 9876543210);
    }

    function testAddContactOnlyOwner() public {
        uint256[] memory phoneNumbers = new uint256[](1);
        phoneNumbers[0] = 1234567890;

        vm.prank(nonOwner);
        vm.expectRevert();
        addressBook.addContact("John", "Doe", phoneNumbers);
    }

    function testAddMultipleContacts() public {
        uint256[] memory phoneNumbers1 = new uint256[](1);
        phoneNumbers1[0] = 1111111111;
        
        uint256[] memory phoneNumbers2 = new uint256[](1);
        phoneNumbers2[0] = 2222222222;

        vm.startPrank(owner);
        uint256 id1 = addressBook.addContact("Alice", "Smith", phoneNumbers1);
        uint256 id2 = addressBook.addContact("Bob", "Johnson", phoneNumbers2);
        vm.stopPrank();
        
        assertEq(id1, 1);
        assertEq(id2, 2);
        
        AddressBook.Contact[] memory allContacts = addressBook.getAllContacts();
        assertEq(allContacts.length, 2);
        assertEq(allContacts[0].firstName, "Alice");
        assertEq(allContacts[1].firstName, "Bob");
    }

    function testDeleteContact() public {
        uint256[] memory phoneNumbers = new uint256[](1);
        phoneNumbers[0] = 1234567890;

        vm.prank(owner);
        uint256 contactId = addressBook.addContact("John", "Doe", phoneNumbers);
        
        vm.prank(owner);
        addressBook.deleteContact(contactId);
        
        vm.expectRevert(abi.encodeWithSelector(AddressBook.ContactNotFound.selector, contactId));
        addressBook.getContact(contactId);
        
        AddressBook.Contact[] memory allContacts = addressBook.getAllContacts();
        assertEq(allContacts.length, 0);
    }

    function testDeleteContactOnlyOwner() public {
        uint256[] memory phoneNumbers = new uint256[](1);
        phoneNumbers[0] = 1234567890;

        vm.prank(owner);
        uint256 contactId = addressBook.addContact("John", "Doe", phoneNumbers);
        
        vm.prank(nonOwner);
        vm.expectRevert();
        addressBook.deleteContact(contactId);
    }

    function testDeleteNonExistentContact() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(AddressBook.ContactNotFound.selector, 999));
        addressBook.deleteContact(999);
    }

    function testGetContact() public {
        uint256[] memory phoneNumbers = new uint256[](2);
        phoneNumbers[0] = 1234567890;
        phoneNumbers[1] = 9876543210;

        vm.prank(owner);
        uint256 contactId = addressBook.addContact("Jane", "Doe", phoneNumbers);
        
        AddressBook.Contact memory contact = addressBook.getContact(contactId);
        assertEq(contact.id, contactId);
        assertEq(contact.firstName, "Jane");
        assertEq(contact.lastName, "Doe");
        assertEq(contact.phoneNumbers.length, 2);
        assertEq(contact.phoneNumbers[0], 1234567890);
        assertEq(contact.phoneNumbers[1], 9876543210);
    }

    function testGetNonExistentContact() public {
        vm.expectRevert(abi.encodeWithSelector(AddressBook.ContactNotFound.selector, 999));
        addressBook.getContact(999);
    }

    function testGetAllContacts() public {
        uint256[] memory phoneNumbers1 = new uint256[](1);
        phoneNumbers1[0] = 1111111111;
        
        uint256[] memory phoneNumbers2 = new uint256[](1);
        phoneNumbers2[0] = 2222222222;
        
        uint256[] memory phoneNumbers3 = new uint256[](1);
        phoneNumbers3[0] = 3333333333;

        vm.startPrank(owner);
        addressBook.addContact("Alice", "Smith", phoneNumbers1);
        uint256 id2 = addressBook.addContact("Bob", "Johnson", phoneNumbers2);
        addressBook.addContact("Charlie", "Brown", phoneNumbers3);
        
        // Delete the middle contact
        addressBook.deleteContact(id2);
        vm.stopPrank();
        
        AddressBook.Contact[] memory allContacts = addressBook.getAllContacts();
        assertEq(allContacts.length, 2);
        assertEq(allContacts[0].firstName, "Alice");
        assertEq(allContacts[1].firstName, "Charlie");
    }

    function testGetContactCount() public {
        assertEq(addressBook.getContactCount(), 0);
        
        uint256[] memory phoneNumbers = new uint256[](1);
        phoneNumbers[0] = 1234567890;

        vm.prank(owner);
        addressBook.addContact("John", "Doe", phoneNumbers);
        
        assertEq(addressBook.getContactCount(), 1);
    }
}

contract AddressBookFactoryTest is Test {
    AddressBookFactory public factory;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        factory = new AddressBookFactory();
    }

    function testDeploy() public {
        vm.prank(user1);
        address deployedAddress = factory.deploy();
        
        assertTrue(deployedAddress != address(0));
        
        AddressBook deployedAddressBook = AddressBook(deployedAddress);
        assertEq(deployedAddressBook.owner(), user1);
    }

    function testMultipleDeploys() public {
        vm.prank(user1);
        address address1 = factory.deploy();
        
        vm.prank(user1);
        address address2 = factory.deploy();
        
        vm.prank(user2);
        address address3 = factory.deploy();
        
        assertTrue(address1 != address2);
        assertTrue(address2 != address3);
        assertTrue(address1 != address3);
        
        assertEq(factory.getDeployedCount(), 3);
    }

    function testGetAddressBooksByOwner() public {
        vm.startPrank(user1);
        address address1 = factory.deploy();
        address address2 = factory.deploy();
        vm.stopPrank();
        
        vm.prank(user2);
        address address3 = factory.deploy();
        
        address[] memory user1AddressBooks = factory.getAddressBooksByOwner(user1);
        address[] memory user2AddressBooks = factory.getAddressBooksByOwner(user2);
        
        assertEq(user1AddressBooks.length, 2);
        assertEq(user2AddressBooks.length, 1);
        
        assertEq(user1AddressBooks[0], address1);
        assertEq(user1AddressBooks[1], address2);
        assertEq(user2AddressBooks[0], address3);
    }

    function testGetAllDeployedAddressBooks() public {
        vm.prank(user1);
        address address1 = factory.deploy();
        
        vm.prank(user2);
        address address2 = factory.deploy();
        
        address[] memory allAddressBooks = factory.getAllDeployedAddressBooks();
        
        assertEq(allAddressBooks.length, 2);
        assertEq(allAddressBooks[0], address1);
        assertEq(allAddressBooks[1], address2);
    }

    function testFactoryTracking() public {
        vm.prank(user1);
        address deployedAddress = factory.deploy();
        
        // Check that the deployed address was recorded
        address[] memory user1AddressBooks = factory.getAddressBooksByOwner(user1);
        assertEq(user1AddressBooks.length, 1);
        assertEq(user1AddressBooks[0], deployedAddress);
        
        // Check that it's also in the global list
        address[] memory allAddressBooks = factory.getAllDeployedAddressBooks();
        assertEq(allAddressBooks.length, 1);
        assertEq(allAddressBooks[0], deployedAddress);
    }
}
