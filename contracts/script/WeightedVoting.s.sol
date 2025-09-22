// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {WeightedVoting} from "../src/WeightedVoting.sol";

contract WeightedVotingScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the WeightedVoting contract
        WeightedVoting voting = new WeightedVoting();
        
        console.log("WeightedVoting deployed to:", address(voting));
        console.log("Token Name:", voting.name());
        console.log("Token Symbol:", voting.symbol());
        console.log("Max Supply:", voting.maxSupply());
        console.log("Current Total Supply:", voting.totalSupply());
        console.log("Issue Count:", voting.getIssueCount());

        vm.stopBroadcast();
    }
}
