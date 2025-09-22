// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GarageManager {
    // Custom error for invalid car index
    error BadCarIndex(uint256 index);

    // Car struct definition - matches exact test specification
    struct Car {
        string make;
        string model;
        string color;
        uint numberOfDoors;     // Test expects uint, not uint8
    }
    
    // Alternative optimized struct for comparison (if we wanted fixed-size strings)
    // struct CarOptimized {
    //     uint8 numberOfDoors;  // 1 byte
    //     bytes32 make;         // 32 bytes - fixed size, more gas efficient for short strings
    //     bytes32 model;        // 32 bytes - fixed size, more gas efficient for short strings
    //     bytes32 color;        // 32 bytes - fixed size, more gas efficient for short strings
    // }

    // Public mapping to store each user's garage (array of cars)
    mapping(address => Car[]) public garage;

    // Events for better UX and logging
    event CarAdded(address indexed owner, uint256 index, string make, string model);
    event CarUpdated(address indexed owner, uint256 index, string make, string model);
    event GarageReset(address indexed owner, uint256 carsRemoved);

    // Add a car to the caller's garage
    function addCar(
        string calldata _make,
        string calldata _model,
        string calldata _color,
        uint _numberOfDoors
    ) external {
        Car memory newCar = Car({
            make: _make,
            model: _model,
            color: _color,
            numberOfDoors: _numberOfDoors
        });
        
        garage[msg.sender].push(newCar);
        
        emit CarAdded(msg.sender, garage[msg.sender].length - 1, _make, _model);
    }

    // Get all cars for the calling user
    function getMyCars() public view returns (Car[] memory) {
        return garage[msg.sender];
    }

    // Get all cars for any given address
    function getUserCars(address _user) public view returns (Car[] memory) {
        return garage[_user];
    }

    // Update an existing car at the given index
    function updateCar(
        uint _index,
        string calldata _make,
        string calldata _model,
        string calldata _color,
        uint _numberOfDoors
    ) external {
        Car[] storage userCars = garage[msg.sender];
        
        // Check if the index is valid
        if (_index >= userCars.length) {
            revert BadCarIndex(_index);
        }
        
        // Update the car
        userCars[_index] = Car({
            make: _make,
            model: _model,
            color: _color,
            numberOfDoors: _numberOfDoors
        });
        
        emit CarUpdated(msg.sender, _index, _make, _model);
    }

    // Reset the caller's garage (delete all cars)
    function resetMyGarage() external {
        uint256 carsRemoved = garage[msg.sender].length;
        delete garage[msg.sender];
        
        emit GarageReset(msg.sender, carsRemoved);
    }

    // Utility functions for better UX and testing

    // Get the number of cars for a specific user
    function getUserCarCount(address _user) public view returns (uint256) {
        return garage[_user].length;
    }

    // Get the number of cars for the caller
    function getMyCarCount() public view returns (uint256) {
        return garage[msg.sender].length;
    }

    // Get a specific car by index for any user
    function getUserCar(address _user, uint256 _index) public view returns (Car memory) {
        if (_index >= garage[_user].length) {
            revert BadCarIndex(_index);
        }
        return garage[_user][_index];
    }

    // Get a specific car by index for the caller
    function getMyCar(uint256 _index) public view returns (Car memory) {
        if (_index >= garage[msg.sender].length) {
            revert BadCarIndex(_index);
        }
        return garage[msg.sender][_index];
    }

    // Remove a specific car by index (bonus functionality)
    function removeCar(uint256 _index) public {
        Car[] storage userCars = garage[msg.sender];
        
        if (_index >= userCars.length) {
            revert BadCarIndex(_index);
        }
        
        // Move the last car to the index being removed and pop the last element
        userCars[_index] = userCars[userCars.length - 1];
        userCars.pop();
    }

    // Check if a user has any cars
    function hasAnyCars(address _user) public view returns (bool) {
        return garage[_user].length > 0;
    }

    // Get all car makes for a user (useful for filtering)
    function getUserCarMakes(address _user) public view returns (string[] memory) {
        Car[] memory userCars = garage[_user];
        string[] memory makes = new string[](userCars.length);
        
        for (uint256 i = 0; i < userCars.length; i++) {
            makes[i] = userCars[i].make;
        }
        
        return makes;
    }

    // Find cars by make for a user
    function getCarsByMake(address _user, string memory _make) public view returns (Car[] memory matchingCars, uint256[] memory indices) {
        Car[] memory userCars = garage[_user];
        
        // First pass: count matching cars
        uint256 matchCount = 0;
        for (uint256 i = 0; i < userCars.length; i++) {
            if (keccak256(abi.encodePacked(userCars[i].make)) == keccak256(abi.encodePacked(_make))) {
                matchCount++;
            }
        }
        
        // Second pass: collect matching cars and their indices
        matchingCars = new Car[](matchCount);
        indices = new uint256[](matchCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < userCars.length; i++) {
            if (keccak256(abi.encodePacked(userCars[i].make)) == keccak256(abi.encodePacked(_make))) {
                matchingCars[currentIndex] = userCars[i];
                indices[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return (matchingCars, indices);
    }
}
