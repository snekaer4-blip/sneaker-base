// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {Employee, Salaried, Hourly, Manager, Salesperson, EngineeringManager, InheritanceSubmission} from "../src/Employee.sol";

contract EmployeeTest is Test {
    Salaried public salariedEmployee;
    Hourly public hourlyEmployee;
    Manager public manager;
    Salesperson public salesperson;
    EngineeringManager public engineeringManager;
    InheritanceSubmission public submission;

    // Test values as specified in the exercise
    uint256 constant SALESPERSON_HOURLY_RATE = 20;
    uint256 constant SALESPERSON_ID = 55555;
    uint256 constant SALESPERSON_MANAGER_ID = 12345;

    uint256 constant MANAGER_ANNUAL_SALARY = 200000;
    uint256 constant MANAGER_ID = 54321;
    uint256 constant MANAGER_MANAGER_ID = 11111;

    function setUp() public {
        // Deploy test contracts
        salariedEmployee = new Salaried(12345, 67890, 75000);
        hourlyEmployee = new Hourly(23456, 67890, 25);
        manager = new Manager();
        
        // Deploy contracts with exercise-specified values
        salesperson = new Salesperson(SALESPERSON_ID, SALESPERSON_MANAGER_ID, SALESPERSON_HOURLY_RATE);
        engineeringManager = new EngineeringManager(MANAGER_ID, MANAGER_MANAGER_ID, MANAGER_ANNUAL_SALARY);
        
        // Deploy submission contract
        submission = new InheritanceSubmission(address(salesperson), address(engineeringManager));
    }

    // Test Employee abstract contract functionality through derived contracts
    function testEmployeeInheritance() public {
        // Test Salaried employee
        assertEq(salariedEmployee.idNumber(), 12345);
        assertEq(salariedEmployee.managerId(), 67890);
        assertEq(salariedEmployee.annualSalary(), 75000);

        // Test Hourly employee
        assertEq(hourlyEmployee.idNumber(), 23456);
        assertEq(hourlyEmployee.managerId(), 67890);
        assertEq(hourlyEmployee.hourlyRate(), 25);
    }

    function testSalariedEmployee() public {
        // Test constructor sets all values correctly
        assertEq(salariedEmployee.idNumber(), 12345);
        assertEq(salariedEmployee.managerId(), 67890);
        assertEq(salariedEmployee.annualSalary(), 75000);

        // Test getAnnualCost override
        assertEq(salariedEmployee.getAnnualCost(), 75000);
    }

    function testHourlyEmployee() public {
        // Test constructor sets all values correctly
        assertEq(hourlyEmployee.idNumber(), 23456);
        assertEq(hourlyEmployee.managerId(), 67890);
        assertEq(hourlyEmployee.hourlyRate(), 25);

        // Test getAnnualCost override (hourly rate * 2080 hours)
        assertEq(hourlyEmployee.getAnnualCost(), 25 * 2080);
        assertEq(hourlyEmployee.getAnnualCost(), 52000);
    }

    function testManagerFunctionality() public {
        // Test initial state
        assertEq(manager.getReportsCount(), 0);
        uint256[] memory initialReports = manager.getReports();
        assertEq(initialReports.length, 0);

        // Test adding reports
        manager.addReport(12345);
        manager.addReport(23456);
        manager.addReport(34567);

        assertEq(manager.getReportsCount(), 3);
        assertTrue(manager.isReport(12345));
        assertTrue(manager.isReport(23456));
        assertTrue(manager.isReport(34567));
        assertFalse(manager.isReport(99999));

        uint256[] memory reports = manager.getReports();
        assertEq(reports.length, 3);
        assertEq(reports[0], 12345);
        assertEq(reports[1], 23456);
        assertEq(reports[2], 34567);
    }

    function testManagerRemoveReport() public {
        // Add some reports
        manager.addReport(12345);
        manager.addReport(23456);
        manager.addReport(34567);
        assertEq(manager.getReportsCount(), 3);

        // Remove middle report
        manager.removeReport(23456);
        assertEq(manager.getReportsCount(), 2);
        assertFalse(manager.isReport(23456));
        assertTrue(manager.isReport(12345));
        assertTrue(manager.isReport(34567));

        // Remove first report
        manager.removeReport(12345);
        assertEq(manager.getReportsCount(), 1);
        assertFalse(manager.isReport(12345));
        assertTrue(manager.isReport(34567));

        // Remove last report
        manager.removeReport(34567);
        assertEq(manager.getReportsCount(), 0);
        assertFalse(manager.isReport(34567));
    }

    function testManagerResetReports() public {
        // Add some reports
        manager.addReport(12345);
        manager.addReport(23456);
        manager.addReport(34567);
        assertEq(manager.getReportsCount(), 3);

        // Reset reports
        manager.resetReports();
        assertEq(manager.getReportsCount(), 0);
        
        uint256[] memory reports = manager.getReports();
        assertEq(reports.length, 0);
        
        assertFalse(manager.isReport(12345));
        assertFalse(manager.isReport(23456));
        assertFalse(manager.isReport(34567));
    }

    function testSalespersonInheritance() public {
        // Test inheritance from Hourly
        assertEq(salesperson.idNumber(), SALESPERSON_ID);
        assertEq(salesperson.managerId(), SALESPERSON_MANAGER_ID);
        assertEq(salesperson.hourlyRate(), SALESPERSON_HOURLY_RATE);

        // Test inherited getAnnualCost function
        assertEq(salesperson.getAnnualCost(), SALESPERSON_HOURLY_RATE * 2080);
        assertEq(salesperson.getAnnualCost(), 41600);

        // Test salesperson-specific function
        assertEq(salesperson.getEmployeeType(), "Salesperson");
    }

    function testEngineeringManagerMultipleInheritance() public {
        // Test inheritance from Salaried
        assertEq(engineeringManager.idNumber(), MANAGER_ID);
        assertEq(engineeringManager.managerId(), MANAGER_MANAGER_ID);
        assertEq(engineeringManager.annualSalary(), MANAGER_ANNUAL_SALARY);
        assertEq(engineeringManager.getAnnualCost(), MANAGER_ANNUAL_SALARY);

        // Test inheritance from Manager
        assertEq(engineeringManager.getReportsCount(), 0);

        // Test adding reports
        engineeringManager.addReport(12345);
        engineeringManager.addEngineerReport(23456);
        assertEq(engineeringManager.getReportsCount(), 2);
        assertTrue(engineeringManager.isReport(12345));
        assertTrue(engineeringManager.isReport(23456));

        // Test engineering manager-specific function
        assertEq(engineeringManager.getEmployeeType(), "Engineering Manager");

        // Test total reports cost calculation
        uint256 totalCost = engineeringManager.getTotalReportsCost();
        assertEq(totalCost, 2 * 100000); // 2 reports * 100000 each
    }

    function testEngineeringManagerResetReports() public {
        // Add some reports
        engineeringManager.addReport(12345);
        engineeringManager.addReport(23456);
        assertEq(engineeringManager.getReportsCount(), 2);

        // Reset reports
        engineeringManager.resetReports();
        assertEq(engineeringManager.getReportsCount(), 0);
    }

    function testInheritanceSubmission() public {
        // Test that addresses are correctly stored
        assertEq(submission.salesPerson(), address(salesperson));
        assertEq(submission.engineeringManager(), address(engineeringManager));

        // Test utility functions
        (uint256 spId, uint256 spManagerId, uint256 spRate, uint256 spCost) = submission.getSalespersonInfo();
        assertEq(spId, SALESPERSON_ID);
        assertEq(spManagerId, SALESPERSON_MANAGER_ID);
        assertEq(spRate, SALESPERSON_HOURLY_RATE);
        assertEq(spCost, SALESPERSON_HOURLY_RATE * 2080);

        (uint256 emId, uint256 emManagerId, uint256 emSalary, uint256 emReports) = submission.getEngineeringManagerInfo();
        assertEq(emId, MANAGER_ID);
        assertEq(emManagerId, MANAGER_MANAGER_ID);
        assertEq(emSalary, MANAGER_ANNUAL_SALARY);
        assertEq(emReports, 0);

        // Test inheritance verification
        (bool spValid, bool emValid) = submission.verifyInheritance();
        assertTrue(spValid);
        assertTrue(emValid);
    }

    function testPolymorphism() public {
        // Test that we can call getAnnualCost on different employee types
        Employee salaryEmp = Employee(address(salariedEmployee));
        Employee hourlyEmp = Employee(address(hourlyEmployee));
        Employee salesEmp = Employee(address(salesperson));
        Employee managerEmp = Employee(address(engineeringManager));

        // Each should return their respective annual cost
        assertEq(salaryEmp.getAnnualCost(), 75000);
        assertEq(hourlyEmp.getAnnualCost(), 52000);
        assertEq(salesEmp.getAnnualCost(), 41600);
        assertEq(managerEmp.getAnnualCost(), 200000);
    }

    function testExerciseSpecificValues() public {
        // Test Salesperson with exact exercise values
        assertEq(salesperson.hourlyRate(), 20);
        assertEq(salesperson.idNumber(), 55555);
        assertEq(salesperson.managerId(), 12345);
        assertEq(salesperson.getAnnualCost(), 20 * 2080); // 41,600

        // Test EngineeringManager with exact exercise values
        assertEq(engineeringManager.annualSalary(), 200000);
        assertEq(engineeringManager.idNumber(), 54321);
        assertEq(engineeringManager.managerId(), 11111);
        assertEq(engineeringManager.getAnnualCost(), 200000);
    }

    function testInheritanceChain() public {
        // Test that Salesperson properly inherits from Hourly which inherits from Employee
        assertTrue(address(salesperson) != address(0));
        
        // Should have all Employee properties
        assertEq(salesperson.idNumber(), SALESPERSON_ID);
        assertEq(salesperson.managerId(), SALESPERSON_MANAGER_ID);
        
        // Should have all Hourly properties
        assertEq(salesperson.hourlyRate(), SALESPERSON_HOURLY_RATE);
        
        // Should implement Employee's virtual function
        assertEq(salesperson.getAnnualCost(), SALESPERSON_HOURLY_RATE * 2080);
    }

    function testMultipleInheritanceChain() public {
        // Test that EngineeringManager properly inherits from both Salaried and Manager
        assertTrue(address(engineeringManager) != address(0));
        
        // Should have all Employee properties (via Salaried)
        assertEq(engineeringManager.idNumber(), MANAGER_ID);
        assertEq(engineeringManager.managerId(), MANAGER_MANAGER_ID);
        
        // Should have all Salaried properties
        assertEq(engineeringManager.annualSalary(), MANAGER_ANNUAL_SALARY);
        
        // Should have all Manager properties
        assertEq(engineeringManager.getReportsCount(), 0);
        
        // Should implement Employee's virtual function
        assertEq(engineeringManager.getAnnualCost(), MANAGER_ANNUAL_SALARY);
    }

    function testDifferentEmployeeTypes() public {
        // Create employees with different rates and salaries
        Hourly lowPaidHourly = new Hourly(11111, 22222, 15); // $15/hour
        Hourly highPaidHourly = new Hourly(33333, 22222, 50); // $50/hour
        Salaried lowPaidSalaried = new Salaried(44444, 22222, 40000); // $40k/year
        Salaried highPaidSalaried = new Salaried(55555, 22222, 150000); // $150k/year

        // Test annual costs
        assertEq(lowPaidHourly.getAnnualCost(), 15 * 2080); // $31,200
        assertEq(highPaidHourly.getAnnualCost(), 50 * 2080); // $104,000
        assertEq(lowPaidSalaried.getAnnualCost(), 40000);
        assertEq(highPaidSalaried.getAnnualCost(), 150000);
    }

    function testManagerWithManyReports() public {
        Manager bigManager = new Manager();
        
        // Add many reports
        for (uint256 i = 1; i <= 10; i++) {
            bigManager.addReport(i * 1000);
        }
        
        assertEq(bigManager.getReportsCount(), 10);
        
        // Check all reports are there
        for (uint256 i = 1; i <= 10; i++) {
            assertTrue(bigManager.isReport(i * 1000));
        }
        
        // Remove some reports
        bigManager.removeReport(3000);
        bigManager.removeReport(7000);
        
        assertEq(bigManager.getReportsCount(), 8);
        assertFalse(bigManager.isReport(3000));
        assertFalse(bigManager.isReport(7000));
        
        // Reset all
        bigManager.resetReports();
        assertEq(bigManager.getReportsCount(), 0);
    }
}
