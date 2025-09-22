// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Abstract base contract for all employee types
abstract contract Employee {
    uint256 public idNumber;
    uint256 public managerId;

    constructor(uint256 _idNumber, uint256 _managerId) {
        idNumber = _idNumber;
        managerId = _managerId;
    }

    // Virtual function to be overridden by derived contracts
    function getAnnualCost() public view virtual returns (uint256);
}

// Salaried employee implementation
contract Salaried is Employee {
    uint256 public annualSalary;

    constructor(uint256 _idNumber, uint256 _managerId, uint256 _annualSalary) 
        Employee(_idNumber, _managerId) 
    {
        annualSalary = _annualSalary;
    }

    // Override the abstract function, make it virtual for further inheritance
    function getAnnualCost() public view virtual override returns (uint256) {
        return annualSalary;
    }
}

// Hourly employee implementation
contract Hourly is Employee {
    uint256 public hourlyRate;

    constructor(uint256 _idNumber, uint256 _managerId, uint256 _hourlyRate) 
        Employee(_idNumber, _managerId) 
    {
        hourlyRate = _hourlyRate;
    }

    // Override the abstract function
    // Annual cost = hourly rate * 2080 hours (40 hours/week * 52 weeks)
    function getAnnualCost() public view override returns (uint256) {
        return hourlyRate * 2080;
    }
}

// Manager contract for managing employee reports
contract Manager {
    uint256[] public employeeIds;

    // Add an employee ID to the reports array
    function addReport(uint256 _employeeId) public {
        employeeIds.push(_employeeId);
    }

    // Reset the reports array to empty
    function resetReports() public {
        delete employeeIds;
    }

    // Get all employee IDs (utility function)
    function getReports() public view returns (uint256[] memory) {
        return employeeIds;
    }

    // Get the number of reports
    function getReportsCount() public view returns (uint256) {
        return employeeIds.length;
    }

    // Check if an employee ID is in reports
    function isReport(uint256 _employeeId) public view returns (bool) {
        for (uint256 i = 0; i < employeeIds.length; i++) {
            if (employeeIds[i] == _employeeId) {
                return true;
            }
        }
        return false;
    }

    // Remove a specific employee ID from reports
    function removeReport(uint256 _employeeId) public {
        for (uint256 i = 0; i < employeeIds.length; i++) {
            if (employeeIds[i] == _employeeId) {
                // Move the last element to this position and pop
                employeeIds[i] = employeeIds[employeeIds.length - 1];
                employeeIds.pop();
                break;
            }
        }
    }
}

// Salesperson inherits from Hourly
contract Salesperson is Hourly {
    constructor(uint256 _idNumber, uint256 _managerId, uint256 _hourlyRate) 
        Hourly(_idNumber, _managerId, _hourlyRate) 
    {
        // Additional setup can be done here if needed
    }

    // Can add salesperson-specific functionality
    function getEmployeeType() public pure returns (string memory) {
        return "Salesperson";
    }
}

// EngineeringManager inherits from both Salaried and Manager
contract EngineeringManager is Salaried, Manager {
    constructor(uint256 _idNumber, uint256 _managerId, uint256 _annualSalary) 
        Salaried(_idNumber, _managerId, _annualSalary) 
    {
        // Constructor calls Salaried constructor which calls Employee constructor
        // Manager has no constructor parameters
    }

    // Can add engineering manager-specific functionality
    function getEmployeeType() public pure returns (string memory) {
        return "Engineering Manager";
    }

    // Override getAnnualCost to potentially add management overhead
    function getAnnualCost() public view override returns (uint256) {
        // For now, just return the base salary
        // Could add management overhead calculation here
        return super.getAnnualCost();
    }

    // Add engineering-specific management functions
    function addEngineerReport(uint256 _engineerId) public {
        addReport(_engineerId);
    }

    // Get total cost of all reports (if they were also Employee contracts)
    function getTotalReportsCost() public view returns (uint256) {
        // This would require the employee IDs to be contract addresses
        // For demonstration purposes, return a calculated value
        return employeeIds.length * 100000; // Assume average cost per report
    }
}

// Submission contract to hold deployed contract addresses
contract InheritanceSubmission {
    address public salesPerson;
    address public engineeringManager;

    // Events for tracking deployments
    event ContractsRegistered(address indexed salesPerson, address indexed engineeringManager);

    constructor(address _salesPerson, address _engineeringManager) {
        salesPerson = _salesPerson;
        engineeringManager = _engineeringManager;
        
        emit ContractsRegistered(_salesPerson, _engineeringManager);
    }

    // Utility functions to interact with the deployed contracts
    function getSalespersonInfo() public view returns (uint256 id, uint256 managerId, uint256 hourlyRate, uint256 annualCost) {
        Salesperson sp = Salesperson(salesPerson);
        return (
            sp.idNumber(),
            sp.managerId(),
            sp.hourlyRate(),
            sp.getAnnualCost()
        );
    }

    function getEngineeringManagerInfo() public view returns (uint256 id, uint256 managerId, uint256 salary, uint256 reportsCount) {
        EngineeringManager em = EngineeringManager(engineeringManager);
        return (
            em.idNumber(),
            em.managerId(),
            em.annualSalary(),
            em.getReportsCount()
        );
    }

    // Verify the inheritance relationships
    function verifyInheritance() public view returns (bool salespersonValid, bool managerValid) {
        // Check if contracts implement expected functions
        try Salesperson(salesPerson).getAnnualCost() returns (uint256) {
            salespersonValid = true;
        } catch {
            salespersonValid = false;
        }

        try EngineeringManager(engineeringManager).getAnnualCost() returns (uint256) {
            try EngineeringManager(engineeringManager).getReportsCount() returns (uint256) {
                managerValid = true;
            } catch {
                managerValid = false;
            }
        } catch {
            managerValid = false;
        }
    }
}
