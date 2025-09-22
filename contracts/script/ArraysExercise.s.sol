// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {ArraysExercise} from "../src/ArraysExercise.sol";

contract ArraysExerciseScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ArraysExercise contract
        new ArraysExercise();

        vm.stopBroadcast();
    }
}
