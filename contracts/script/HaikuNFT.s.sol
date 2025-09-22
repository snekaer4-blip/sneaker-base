// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {HaikuNFT} from "../src/HaikuNFT.sol";

contract HaikuNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the HaikuNFT contract
        HaikuNFT haikuNFT = new HaikuNFT();
        
        console.log("HaikuNFT deployed to:", address(haikuNFT));
        console.log("Token Name:", haikuNFT.name());
        console.log("Token Symbol:", haikuNFT.symbol());
        console.log("Initial Counter:", haikuNFT.counter());
        console.log("Total Haikus:", haikuNFT.getTotalHaikus());

        vm.stopBroadcast();
    }
}
