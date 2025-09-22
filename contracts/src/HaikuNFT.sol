// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract HaikuNFT is ERC721 {
    // Custom errors
    error HaikuNotUnique();
    error NotYourHaiku(uint256 haikuId);
    error NoHaikusShared();

    // Haiku struct
    struct Haiku {
        address author;
        string line1;
        string line2;
        string line3;
    }

    // Public storage variables
    Haiku[] public haikus;
    mapping(address => uint256[]) public sharedHaikus;
    uint256 public counter;

    // Internal tracking for uniqueness
    mapping(string => bool) private usedLines;

    // Events
    event HaikuMinted(uint256 indexed tokenId, address indexed author, string line1, string line2, string line3);
    event HaikuShared(uint256 indexed haikuId, address indexed from, address indexed to);

    /**
     * @dev Constructor initializes the ERC-721 token
     */
    constructor() ERC721("HaikuNFT", "HAIKU") {
        // Initialize counter to 1 (no haiku should have id 0)
        counter = 1;
        
        // Add a placeholder at index 0 so haiku IDs align with array indices
        haikus.push(Haiku({
            author: address(0),
            line1: "",
            line2: "",
            line3: ""
        }));
    }

    /**
     * @dev Mint a new Haiku NFT with unique content validation
     * @param _line1 First line of the haiku
     * @param _line2 Second line of the haiku
     * @param _line3 Third line of the haiku
     */
    function mintHaiku(string memory _line1, string memory _line2, string memory _line3) external {
        // Convert lines to lowercase for uniqueness check
        string memory line1Lower = _toLower(_line1);
        string memory line2Lower = _toLower(_line2);
        string memory line3Lower = _toLower(_line3);
        
        // Check if any line has been used before
        if (usedLines[line1Lower] || usedLines[line2Lower] || usedLines[line3Lower]) {
            revert HaikuNotUnique();
        }
        
        // Mark lines as used
        usedLines[line1Lower] = true;
        usedLines[line2Lower] = true;
        usedLines[line3Lower] = true;
        
        // Create and store the haiku
        Haiku memory newHaiku = Haiku({
            author: msg.sender,
            line1: _line1,
            line2: _line2,
            line3: _line3
        });
        
        haikus.push(newHaiku);
        
        // Mint the NFT with the current counter as token ID
        _mint(msg.sender, counter);
        
        emit HaikuMinted(counter, msg.sender, _line1, _line2, _line3);
        
        // Increment counter for next haiku
        counter++;
    }

    /**
     * @dev Share a haiku with another address
     * @param _to Address to share the haiku with
     * @param _haikuId ID of the haiku to share
     */
    function shareHaiku(address _to, uint256 _haikuId) public {
        // Check if the caller owns the haiku NFT
        if (ownerOf(_haikuId) != msg.sender) {
            revert NotYourHaiku(_haikuId);
        }
        
        // Add haiku to the recipient's shared haikus
        sharedHaikus[_to].push(_haikuId);
        
        emit HaikuShared(_haikuId, msg.sender, _to);
    }

    /**
     * @dev Get all haikus shared with the caller
     * @return sharedHaikuData Array of haikus shared with the caller
     */
    function getMySharedHaikus() public view returns (Haiku[] memory sharedHaikuData) {
        uint256[] memory mySharedIds = sharedHaikus[msg.sender];
        
        if (mySharedIds.length == 0) {
            revert NoHaikusShared();
        }
        
        sharedHaikuData = new Haiku[](mySharedIds.length);
        
        for (uint256 i = 0; i < mySharedIds.length; i++) {
            sharedHaikuData[i] = haikus[mySharedIds[i]];
        }
        
        return sharedHaikuData;
    }

    /**
     * @dev Get a haiku by its ID
     * @param _haikuId ID of the haiku
     * @return haiku The haiku data
     */
    function getHaiku(uint256 _haikuId) public view returns (Haiku memory haiku) {
        require(_haikuId > 0 && _haikuId < haikus.length, "Invalid haiku ID");
        return haikus[_haikuId];
    }

    /**
     * @dev Get all haikus authored by a specific address
     * @param _author Address of the author
     * @return authorHaikus Array of haikus by the author
     */
    function getHaikusByAuthor(address _author) public view returns (Haiku[] memory authorHaikus) {
        // First, count how many haikus the author has
        uint256 count = 0;
        for (uint256 i = 1; i < haikus.length; i++) {
            if (haikus[i].author == _author) {
                count++;
            }
        }
        
        // Create array and populate it
        authorHaikus = new Haiku[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < haikus.length; i++) {
            if (haikus[i].author == _author) {
                authorHaikus[index] = haikus[i];
                index++;
            }
        }
        
        return authorHaikus;
    }

    /**
     * @dev Get the total number of minted haikus
     * @return uint256 Total number of haikus (excluding index 0)
     */
    function getTotalHaikus() public view returns (uint256) {
        return haikus.length - 1; // Subtract 1 for the placeholder at index 0
    }

    /**
     * @dev Get haiku IDs shared with a specific address
     * @param _address Address to check
     * @return uint256[] Array of haiku IDs shared with the address
     */
    function getSharedHaikuIds(address _address) public view returns (uint256[] memory) {
        return sharedHaikus[_address];
    }

    /**
     * @dev Convert a string to lowercase (simplified for common characters)
     * @param _str String to convert
     * @return string Lowercase string
     */
    function _toLower(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        bytes memory lowerBytes = new bytes(strBytes.length);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            // Convert A-Z to a-z
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {
                lowerBytes[i] = bytes1(uint8(strBytes[i]) + 32);
            } else {
                lowerBytes[i] = strBytes[i];
            }
        }
        
        return string(lowerBytes);
    }

    /**
     * @dev Override tokenURI to provide metadata for the NFT
     * @param tokenId Token ID
     * @return string Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        
        Haiku memory haiku = haikus[tokenId];
        
        // Simple JSON metadata (in a real implementation, you'd want proper JSON encoding)
        return string(abi.encodePacked(
            '{"name": "Haiku #', _toString(tokenId), 
            '", "description": "A unique haiku poem", "attributes": [',
            '{"trait_type": "Author", "value": "', _toAddressString(haiku.author), '"},',
            '{"trait_type": "Line Count", "value": "3"}]}'
        ));
    }

    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Convert address to string
     */
    function _toAddressString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
            str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }
}
