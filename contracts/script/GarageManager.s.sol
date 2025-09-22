// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {GarageManager} from "../src/GarageManager.sol";

contract GarageManagerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GarageManager contract
        GarageManager garageManager = new GarageManager();
        
        console.log("GarageManager deployed to:", address(garageManager));
        console.log("Contract optimized for storage packing");

        vm.stopBroadcast();
    }
}
