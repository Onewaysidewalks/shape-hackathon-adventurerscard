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
}