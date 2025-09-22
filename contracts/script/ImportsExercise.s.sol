// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {ImportsExercise} from "../src/ImportsExercise.sol";
import {SillyStringUtils} from "../src/SillyStringUtils.sol";

contract ImportsExerciseScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ImportsExercise contract
        // Note: SillyStringUtils is a library and gets embedded in the contract
        ImportsExercise importsExercise = new ImportsExercise();

        // Initialize with a sample haiku to demonstrate functionality
        importsExercise.saveHaiku(
            "Smart contracts live",
            "In blockchain's eternal dance",
            "Code becomes poetry"
        );

        vm.stopBroadcast();

        // Log deployment information
        console.log("ImportsExercise deployed at:", address(importsExercise));
        
        // Test the deployment
        console.log("Testing deployed contract...");
        SillyStringUtils.Haiku memory savedHaiku = importsExercise.getHaiku();
        console.log("Saved haiku line 1:", savedHaiku.line1);
        console.log("Saved haiku line 2:", savedHaiku.line2);
        console.log("Saved haiku line 3:", savedHaiku.line3);
        
        // Test shruggie functionality
        SillyStringUtils.Haiku memory shruggieHaiku = importsExercise.shruggieHaiku();
        console.log("Shruggie line 3:", shruggieHaiku.line3);
        
        // Test library function directly
        string memory testShruggie = importsExercise.applyShruggie("Hello world");
        console.log("Direct shruggie test:", testShruggie);
    }
}
