// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {EmployeeStorage} from "../src/EmployeeStorage.sol";

contract EmployeeStorageScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy with the required test values
        new EmployeeStorage(
            1000,           // shares
            "Pat",          // name
            50000,          // salary
            112358132134    // idNumber
        );

        vm.stopBroadcast();
    }
}
