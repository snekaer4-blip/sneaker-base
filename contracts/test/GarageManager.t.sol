// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {GarageManager} from "../src/GarageManager.sol";

contract GarageManagerTest is Test {
    GarageManager public garageManager;
    
    // Test addresses
    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    // Sample car data
    struct TestCar {
        string make;
        string model;
        string color;
        uint numberOfDoors;
    }

    TestCar[] testCars;

    function setUp() public {
        garageManager = new GarageManager();
        
        // Initialize test car data
        testCars.push(TestCar("Toyota", "Camry", "Blue", 4));
        testCars.push(TestCar("Honda", "Civic", "Red", 4));
        testCars.push(TestCar("Ford", "Mustang", "Yellow", 2));
        testCars.push(TestCar("Tesla", "Model S", "Black", 4));
        testCars.push(TestCar("BMW", "X5", "White", 4));
    }

    function testInitialState() public {
        // Test that new users have empty garages
        assertEq(garageManager.getMyCarCount(), 0);
        assertEq(garageManager.getUserCarCount(alice), 0);
        assertFalse(garageManager.hasAnyCars(alice));
        
        GarageManager.Car[] memory cars = garageManager.getMyCars();
        assertEq(cars.length, 0);
    }

    function testAddSingleCar() public {
        vm.prank(alice);
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        assertEq(garageManager.getUserCarCount(alice), 1);
        assertTrue(garageManager.hasAnyCars(alice));
        
        GarageManager.Car[] memory aliceCars = garageManager.getUserCars(alice);
        assertEq(aliceCars.length, 1);
        assertEq(aliceCars[0].make, "Toyota");
        assertEq(aliceCars[0].model, "Camry");
        assertEq(aliceCars[0].color, "Blue");
        assertEq(aliceCars[0].numberOfDoors, 4);
    }

    function testAddMultipleCars() public {
        vm.startPrank(alice);
        
        for (uint i = 0; i < testCars.length; i++) {
            garageManager.addCar(
                testCars[i].make,
                testCars[i].model,
                testCars[i].color,
                testCars[i].numberOfDoors
            );
        }
        
        vm.stopPrank();
        
        assertEq(garageManager.getUserCarCount(alice), testCars.length);
        
        GarageManager.Car[] memory aliceCars = garageManager.getUserCars(alice);
        assertEq(aliceCars.length, testCars.length);
        
        // Verify each car
        for (uint i = 0; i < testCars.length; i++) {
            assertEq(aliceCars[i].make, testCars[i].make);
            assertEq(aliceCars[i].model, testCars[i].model);
            assertEq(aliceCars[i].color, testCars[i].color);
            assertEq(aliceCars[i].numberOfDoors, testCars[i].numberOfDoors);
        }
    }

    function testGetMyCars() public {
        vm.prank(alice);
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        vm.prank(alice);
        GarageManager.Car[] memory myCars = garageManager.getMyCars();
        
        assertEq(myCars.length, 1);
        assertEq(myCars[0].make, "Toyota");
        assertEq(myCars[0].model, "Camry");
    }

    function testGetUserCars() public {
        vm.prank(alice);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        
        // Anyone can view Alice's cars
        GarageManager.Car[] memory aliceCars = garageManager.getUserCars(alice);
        assertEq(aliceCars.length, 1);
        assertEq(aliceCars[0].make, "Honda");
        assertEq(aliceCars[0].model, "Civic");
    }

    function testMultipleUsersIndependentGarages() public {
        // Alice adds a car
        vm.prank(alice);
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        // Bob adds a different car
        vm.prank(bob);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        
        // Charlie adds no cars
        
        // Verify independent garages
        assertEq(garageManager.getUserCarCount(alice), 1);
        assertEq(garageManager.getUserCarCount(bob), 1);
        assertEq(garageManager.getUserCarCount(charlie), 0);
        
        GarageManager.Car[] memory aliceCars = garageManager.getUserCars(alice);
        GarageManager.Car[] memory bobCars = garageManager.getUserCars(bob);
        GarageManager.Car[] memory charlieCars = garageManager.getUserCars(charlie);
        
        assertEq(aliceCars[0].make, "Toyota");
        assertEq(bobCars[0].make, "Honda");
        assertEq(charlieCars.length, 0);
    }

    function testUpdateCarSuccess() public {
        vm.startPrank(alice);
        
        // Add initial car
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        // Update the car
        garageManager.updateCar(0, "Toyota", "Prius", "Green", 4);
        
        vm.stopPrank();
        
        GarageManager.Car memory updatedCar = garageManager.getUserCar(alice, 0);
        assertEq(updatedCar.make, "Toyota");
        assertEq(updatedCar.model, "Prius");
        assertEq(updatedCar.color, "Green");
        assertEq(updatedCar.numberOfDoors, 4);
    }

    function testUpdateCarInvalidIndex() public {
        vm.startPrank(alice);
        
        // Add one car
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        // Try to update index 1 (should fail since we only have index 0)
        vm.expectRevert(abi.encodeWithSelector(GarageManager.BadCarIndex.selector, 1));
        garageManager.updateCar(1, "Honda", "Civic", "Red", 4);
        
        vm.stopPrank();
    }

    function testUpdateCarEmptyGarage() public {
        vm.prank(alice);
        // Try to update index 0 in empty garage
        vm.expectRevert(abi.encodeWithSelector(GarageManager.BadCarIndex.selector, 0));
        garageManager.updateCar(0, "Honda", "Civic", "Red", 4);
    }

    function testResetMyGarage() public {
        vm.startPrank(alice);
        
        // Add multiple cars
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        garageManager.addCar("Ford", "Mustang", "Yellow", 2);
        
        // Verify cars were added
        assertEq(garageManager.getMyCarCount(), 3);
        
        // Reset garage
        garageManager.resetMyGarage();
        
        // Verify garage is empty
        assertEq(garageManager.getMyCarCount(), 0);
        assertFalse(garageManager.hasAnyCars(alice));
        
        GarageManager.Car[] memory cars = garageManager.getMyCars();
        assertEq(cars.length, 0);
        
        vm.stopPrank();
    }

    function testResetDoesNotAffectOtherUsers() public {
        // Alice adds cars
        vm.prank(alice);
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        // Bob adds cars
        vm.prank(bob);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        
        // Alice resets her garage
        vm.prank(alice);
        garageManager.resetMyGarage();
        
        // Verify Alice's garage is empty but Bob's is intact
        assertEq(garageManager.getUserCarCount(alice), 0);
        assertEq(garageManager.getUserCarCount(bob), 1);
        
        GarageManager.Car[] memory bobCars = garageManager.getUserCars(bob);
        assertEq(bobCars[0].make, "Honda");
    }

    function testGetMyCarFunction() public {
        vm.startPrank(alice);
        
        garageManager.addCar("Tesla", "Model S", "Black", 4);
        
        GarageManager.Car memory myCar = garageManager.getMyCar(0);
        assertEq(myCar.make, "Tesla");
        assertEq(myCar.model, "Model S");
        assertEq(myCar.color, "Black");
        assertEq(myCar.numberOfDoors, 4);
        
        vm.stopPrank();
    }

    function testGetMyCarInvalidIndex() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(GarageManager.BadCarIndex.selector, 0));
        garageManager.getMyCar(0);
    }

    function testGetUserCarFunction() public {
        vm.prank(alice);
        garageManager.addCar("BMW", "X5", "White", 4);
        
        GarageManager.Car memory aliceCar = garageManager.getUserCar(alice, 0);
        assertEq(aliceCar.make, "BMW");
        assertEq(aliceCar.model, "X5");
        assertEq(aliceCar.color, "White");
        assertEq(aliceCar.numberOfDoors, 4);
    }

    function testRemoveCarFunction() public {
        vm.startPrank(alice);
        
        // Add three cars
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        garageManager.addCar("Ford", "Mustang", "Yellow", 2);
        
        assertEq(garageManager.getMyCarCount(), 3);
        
        // Remove the middle car (index 1 - Honda Civic)
        garageManager.removeCar(1);
        
        assertEq(garageManager.getMyCarCount(), 2);
        
        // The last car should now be at index 1 (Ford Mustang moved to replace Honda)
        GarageManager.Car memory carAtIndex1 = garageManager.getMyCar(1);
        assertEq(carAtIndex1.make, "Ford");
        assertEq(carAtIndex1.model, "Mustang");
        
        // First car should remain unchanged
        GarageManager.Car memory carAtIndex0 = garageManager.getMyCar(0);
        assertEq(carAtIndex0.make, "Toyota");
        assertEq(carAtIndex0.model, "Camry");
        
        vm.stopPrank();
    }

    function testRemoveCarInvalidIndex() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(GarageManager.BadCarIndex.selector, 0));
        garageManager.removeCar(0);
    }

    function testGetUserCarMakes() public {
        vm.startPrank(alice);
        
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        garageManager.addCar("Toyota", "Prius", "Green", 4);
        
        vm.stopPrank();
        
        string[] memory makes = garageManager.getUserCarMakes(alice);
        assertEq(makes.length, 3);
        assertEq(makes[0], "Toyota");
        assertEq(makes[1], "Honda");
        assertEq(makes[2], "Toyota");
    }

    function testGetCarsByMake() public {
        vm.startPrank(alice);
        
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        garageManager.addCar("Honda", "Civic", "Red", 4);
        garageManager.addCar("Toyota", "Prius", "Green", 4);
        garageManager.addCar("Ford", "Mustang", "Yellow", 2);
        garageManager.addCar("Toyota", "Corolla", "Silver", 4);
        
        vm.stopPrank();
        
        (GarageManager.Car[] memory toyotaCars, uint256[] memory indices) = garageManager.getCarsByMake(alice, "Toyota");
        
        assertEq(toyotaCars.length, 3);
        assertEq(indices.length, 3);
        
        // Check the cars
        assertEq(toyotaCars[0].model, "Camry");
        assertEq(toyotaCars[1].model, "Prius");
        assertEq(toyotaCars[2].model, "Corolla");
        
        // Check the indices
        assertEq(indices[0], 0);
        assertEq(indices[1], 2);
        assertEq(indices[2], 4);
    }

    function testGetCarsByMakeNotFound() public {
        vm.prank(alice);
        garageManager.addCar("Toyota", "Camry", "Blue", 4);
        
        (GarageManager.Car[] memory cars, uint256[] memory indices) = garageManager.getCarsByMake(alice, "Ferrari");
        
        assertEq(cars.length, 0);
        assertEq(indices.length, 0);
    }

    function testEdgeCasesDoorNumbers() public {
        vm.startPrank(alice);
        
        // Test edge cases for number of doors
        garageManager.addCar("Smart", "ForTwo", "Red", 2);  // 2 doors
        garageManager.addCar("McLaren", "P1", "Orange", 2); // 2 doors (sports car)
        
        GarageManager.Car[] memory cars = garageManager.getMyCars();
        assertEq(cars[0].numberOfDoors, 2);
        assertEq(cars[1].numberOfDoors, 2);
        
        vm.stopPrank();
    }

    function testLongStringHandling() public {
        vm.startPrank(alice);
        
        // Test with longer strings
        string memory longMake = "Mercedes-Benz";
        string memory longModel = "AMG GT 63 S 4MATIC+ 4-Door Coupe";
        string memory longColor = "Magnetite Black Metallic";
        
        garageManager.addCar(longMake, longModel, longColor, 4);
        
        GarageManager.Car memory car = garageManager.getMyCar(0);
        assertEq(car.make, longMake);
        assertEq(car.model, longModel);
        assertEq(car.color, longColor);
        assertEq(car.numberOfDoors, 4);
        
        vm.stopPrank();
    }

    function testCarStructPacking() public {
        // This test verifies that the struct is properly handled
        vm.startPrank(alice);
        garageManager.addCar("Test", "Car", "Blue", 255); // Test value
        
        GarageManager.Car memory car = garageManager.getMyCar(0);
        assertEq(car.numberOfDoors, 255);
        
        vm.stopPrank();
    }
}
