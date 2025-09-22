// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {UnburnableToken} from "../src/UnburnableToken.sol";

contract UnburnableTokenScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the UnburnableToken
        UnburnableToken token = new UnburnableToken();
        
        console.log("UnburnableToken deployed to:", address(token));
        console.log("Total Supply:", token.totalSupply());
        console.log("Claim Amount:", token.CLAIM_AMOUNT());

        vm.stopBroadcast();
    }
}
