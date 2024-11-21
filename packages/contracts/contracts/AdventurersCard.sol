// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract AdventurersCard is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct CharacterStats {
        uint8 attack;
        uint8 defense;
        uint8 hp;
        uint8 speed;
        uint8 critChance;
        uint8 evadeChance;
        uint8 blockChance;
        uint8 counterChance;
    }

    mapping(uint256 => CharacterStats) public characterStats;
    uint256 private _nextTokenId;
    string private _baseURIextended;
    mapping(address => bool) public hasMinted;
    mapping(address => bool) public isWhitelisted;

    event StatsUpdated(uint256 indexed tokenId, CharacterStats newStats);

    constructor() ERC721("Adventurers Card", "ADVCARD") Ownable(msg.sender) {}

    function safeMint(address to) public {
        require(!hasMinted[to], "Address has already minted");
        
        uint256 tokenId = _nextTokenId++;
        hasMinted[to] = true;
        _safeMint(to, tokenId);

        characterStats[tokenId] = CharacterStats(
            1, // attack
            1, // defense
            1, // hp
            1, // speed
            0, // crit
            0, // evade
            0, // block
            0  // counter
        );
    }

    function getCharacterStats(uint256 tokenId) public view returns (CharacterStats memory) {
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        return characterStats[tokenId];
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Base URI
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIextended;
    }

    // Override transfer functions to prevent transfers and only allow minting
    function _update(address to, uint256 id, address auth) internal virtual override returns (address) {
        if (auth != address(0)) {
            revert("Transfers not allowed");
        }

        return super._update(to, id, auth);
    }

    // Override approve functions to prevent approvals
    function approve(address, uint256) public virtual override(ERC721, IERC721) {
        revert("Approvals not allowed");
    }

    function setApprovalForAll(address, bool) public virtual override(ERC721, IERC721) {
        revert("Approvals not allowed");
    }

    function setWhitelistStatus(address operator, bool status) external onlyOwner {
        isWhitelisted[operator] = status;
    }

    function modifyStats(uint256 tokenId, CharacterStats calldata statChanges) external {
        require(isWhitelisted[msg.sender], "Not authorized to modify stats");
        require(_ownerOf(tokenId) != address(0), "Character does not exist");
        
        CharacterStats storage currentStats = characterStats[tokenId];
        CharacterStats memory newStats = CharacterStats(
            uint8(max(1, int8(currentStats.attack) + int8(statChanges.attack))),
            uint8(max(1, int8(currentStats.defense) + int8(statChanges.defense))),
            uint8(max(1, int8(currentStats.hp) + int8(statChanges.hp))),
            uint8(max(1, int8(currentStats.speed) + int8(statChanges.speed))),
            uint8(max(0, int8(currentStats.critChance) + int8(statChanges.critChance))),
            uint8(max(0, int8(currentStats.evadeChance) + int8(statChanges.evadeChance))),
            uint8(max(0, int8(currentStats.blockChance) + int8(statChanges.blockChance))),
            uint8(max(0, int8(currentStats.counterChance) + int8(statChanges.counterChance)))
        );
        
        characterStats[tokenId] = newStats;
        emit StatsUpdated(tokenId, newStats);
    }

    function max(int8 a, int8 b) internal pure returns (int8) {
        return a >= b ? a : b;
    }
}