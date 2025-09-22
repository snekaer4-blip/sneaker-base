// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AddressBookFactory} from "../src/AddressBookFactory.sol";

contract AddressBookScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the AddressBookFactory
        AddressBookFactory factory = new AddressBookFactory();
        
        console.log("AddressBookFactory deployed to:", address(factory));

        vm.stopBroadcast();
    }
}
