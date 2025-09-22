// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {EmployeeStorage} from "../src/EmployeeStorage.sol";

contract EmployeeStorageTest is Test {
    EmployeeStorage public employeeStorage;

    // Required deployment values
    uint16 constant INITIAL_SHARES = 1000;
    string constant INITIAL_NAME = "Pat";
    uint32 constant INITIAL_SALARY = 50000;
    uint256 constant INITIAL_ID = 112358132134;

    function setUp() public {
        employeeStorage = new EmployeeStorage(
            INITIAL_SHARES,
            INITIAL_NAME,
            INITIAL_SALARY,
            INITIAL_ID
        );
    }

    function testInitialValues() public {
        // Test constructor initialization
        assertEq(employeeStorage.viewShares(), INITIAL_SHARES);
        assertEq(employeeStorage.name(), INITIAL_NAME);
        assertEq(employeeStorage.viewSalary(), INITIAL_SALARY);
        assertEq(employeeStorage.idNumber(), INITIAL_ID);
    }

    function testViewFunctions() public {
        // Test view functions return correct values
        assertEq(employeeStorage.viewSalary(), 50000);
        assertEq(employeeStorage.viewShares(), 1000);
    }

    function testGrantSharesNormal() public {
        // Test normal share granting (should work)
        uint16 initialShares = employeeStorage.viewShares();
        uint16 newShares = 500;
        
        employeeStorage.grantShares(newShares);
        
        assertEq(employeeStorage.viewShares(), initialShares + newShares);
    }

    function testGrantSharesMaxAllowed() public {
        // Test granting shares up to exactly 5000 (should work)
        uint16 currentShares = employeeStorage.viewShares(); // 1000
        uint16 maxAdditional = 4000; // 1000 + 4000 = 5000
        
        employeeStorage.grantShares(maxAdditional);
        
        assertEq(employeeStorage.viewShares(), 5000);
    }

    function testGrantSharesExceedsLimit() public {
        // Test granting shares that would exceed 5000 (should revert with custom error)
        uint16 currentShares = employeeStorage.viewShares(); // 1000
        uint16 excessiveShares = 4001; // 1000 + 4001 = 5001 > 5000
        
        vm.expectRevert(
            abi.encodeWithSelector(
                EmployeeStorage.TooManyShares.selector, 
                uint256(currentShares) + uint256(excessiveShares)
            )
        );
        employeeStorage.grantShares(excessiveShares);
    }

    function testGrantSharesDirectlyTooMany() public {
        // Test granting more than 5000 shares directly (should revert with string)
        uint16 tooManyShares = 5001;
        
        vm.expectRevert("Too many shares");
        employeeStorage.grantShares(tooManyShares);
    }

    function testDebugResetShares() public {
        // Test debug reset function
        employeeStorage.grantShares(2000); // Now has 3000 shares
        assertEq(employeeStorage.viewShares(), 3000);
        
        employeeStorage.debugResetShares();
        assertEq(employeeStorage.viewShares(), 1000);
    }

    function testStoragePacking() public {
        // Test that shares and salary are packed in the same storage slot
        // Slot 0 should contain both shares and salary
        uint256 slot0 = employeeStorage.checkForPacking(0);
        
        // shares should be in the lower 16 bits
        uint16 sharesFromStorage = uint16(slot0);
        assertEq(sharesFromStorage, INITIAL_SHARES);
        
        // salary should be in the next 32 bits (bits 16-47)
        uint32 salaryFromStorage = uint32(slot0 >> 16);
        assertEq(salaryFromStorage, INITIAL_SALARY);
        
        // Verify slot 0 is not zero (contains packed data)
        assertTrue(slot0 != 0);
    }

    function testStorageSlotIdNumber() public {
        // Test that idNumber is in slot 1
        uint256 slot1 = employeeStorage.checkForPacking(1);
        assertEq(slot1, INITIAL_ID);
    }

    function testPublicVariables() public {
        // Test public variables are accessible
        assertEq(employeeStorage.name(), "Pat");
        assertEq(employeeStorage.idNumber(), 112358132134);
    }

    function testLargeIdNumber() public {
        // Test with maximum possible ID number
        uint256 maxId = type(uint256).max;
        EmployeeStorage largeIdEmployee = new EmployeeStorage(
            1000,
            "MaxId",
            100000,
            maxId
        );
        
        assertEq(largeIdEmployee.idNumber(), maxId);
    }

    function testEdgeCaseSalary() public {
        // Test with maximum salary (1,000,000)
        uint32 maxSalary = 1000000;
        EmployeeStorage highSalaryEmployee = new EmployeeStorage(
            1000,
            "HighEarner",
            maxSalary,
            123456
        );
        
        assertEq(highSalaryEmployee.viewSalary(), maxSalary);
    }

    function testGrantSharesBoundary() public {
        // Test granting exactly 5001 shares in one go (should revert with string message)
        vm.expectRevert("Too many shares");
        employeeStorage.grantShares(5001);
        
        // Test granting exactly 6000 shares in one go (should revert with string message)
        vm.expectRevert("Too many shares");
        employeeStorage.grantShares(6000);
        
        // Test granting 5000 shares to someone with 1000 (total would be 6000, should use custom error)
        vm.expectRevert(
            abi.encodeWithSelector(
                EmployeeStorage.TooManyShares.selector, 
                6000
            )
        );
        employeeStorage.grantShares(5000);
        
        // Test granting 4001 shares to someone with 1000 (total would be 5001, should use custom error)
        vm.expectRevert(
            abi.encodeWithSelector(
                EmployeeStorage.TooManyShares.selector, 
                5001
            )
        );
        employeeStorage.grantShares(4001);
    }
}
