// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {FavoriteRecords} from "../src/FavoriteRecords.sol";

contract FavoriteRecordsScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the FavoriteRecords contract
        // Constructor automatically loads the approved records
        new FavoriteRecords();

        vm.stopBroadcast();
    }
}
