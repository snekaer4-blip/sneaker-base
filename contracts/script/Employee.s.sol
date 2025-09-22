// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Salesperson, EngineeringManager, InheritanceSubmission} from "../src/Employee.sol";

contract EmployeeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Salesperson with specified values
        // Hourly rate: 20, ID: 55555, Manager ID: 12345
        Salesperson salesperson = new Salesperson(55555, 12345, 20);
        
        // Deploy EngineeringManager with specified values  
        // Annual salary: 200,000, ID: 54321, Manager ID: 11111
        EngineeringManager engineeringManager = new EngineeringManager(54321, 11111, 200000);

        // Deploy InheritanceSubmission with the deployed contract addresses
        InheritanceSubmission submission = new InheritanceSubmission(
            address(salesperson), 
            address(engineeringManager)
        );

        vm.stopBroadcast();
        
        // Log the deployed addresses for verification
        console.log("Salesperson deployed at:", address(salesperson));
        console.log("EngineeringManager deployed at:", address(engineeringManager));
        console.log("InheritanceSubmission deployed at:", address(submission));
        
        // Verify the deployment values
        console.log("Salesperson ID:", salesperson.idNumber());
        console.log("Salesperson Manager ID:", salesperson.managerId());
        console.log("Salesperson Hourly Rate:", salesperson.hourlyRate());
        console.log("Salesperson Annual Cost:", salesperson.getAnnualCost());
        
        console.log("Engineering Manager ID:", engineeringManager.idNumber());
        console.log("Engineering Manager Manager ID:", engineeringManager.managerId());
        console.log("Engineering Manager Salary:", engineeringManager.annualSalary());
        console.log("Engineering Manager Annual Cost:", engineeringManager.getAnnualCost());
    }
}

// Separate script for just deploying the individual contracts
contract DeployIndividualScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Salesperson with specified values
        new Salesperson(55555, 12345, 20);
        
        // Deploy EngineeringManager with specified values
        new EngineeringManager(54321, 11111, 200000);

        vm.stopBroadcast();
    }
}

// Script for deploying InheritanceSubmission with existing contract addresses
contract DeploySubmissionScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // These addresses need to be updated with actual deployed contract addresses
        address salespersonAddress = vm.envAddress("SALESPERSON_ADDRESS");
        address engineeringManagerAddress = vm.envAddress("ENGINEERING_MANAGER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        new InheritanceSubmission(salespersonAddress, engineeringManagerAddress);

        vm.stopBroadcast();
    }
}
