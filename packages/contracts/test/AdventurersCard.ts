import { expect } from "chai";
import { ethers } from "hardhat";
import { AdventurersCard } from "../typechain-types/contracts/AdventurersCard";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ContractFactory } from "ethers";

describe("AdventurersCard", function () {
  let AdventurersCard: ContractFactory;
  let adventurersCard: AdventurersCard;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    AdventurersCard = await ethers.getContractFactory("AdventurersCard");
    adventurersCard = (await AdventurersCard.deploy()) as AdventurersCard;
  });

  describe("Minting", function () {
    it("Should mint a new character with all stats initialized to 1", async function () {
      await adventurersCard.safeMint(addr1.address);

      const stats = await adventurersCard.getCharacterStats(0);
      
      // Check that all stats are initialized to 1
      expect(Number(stats.attack)).to.equal(1);
      expect(Number(stats.defense)).to.equal(1);
      expect(Number(stats.hp)).to.equal(1);
      expect(Number(stats.speed)).to.equal(1);
      expect(Number(stats.critChance)).to.equal(0);
      expect(Number(stats.evadeChance)).to.equal(0);
      expect(Number(stats.blockChance)).to.equal(0);
      expect(Number(stats.counterChance)).to.equal(0);
    });
  });

  describe("Minting restrictions", function () {
    it("Should prevent minting twice to the same address", async function () {
      // First mint should succeed
      await adventurersCard.safeMint(addr1.address);
      
      // Second mint should fail
      await expect(
        adventurersCard.safeMint(addr1.address)
      ).to.be.revertedWith("Address has already minted");
    });

    it("Should prevent approval operations", async function () {
      await adventurersCard.safeMint(addr1.address);
      
      await expect(
        adventurersCard.approve(addr1.address, 0)
      ).to.be.revertedWith("Approvals not allowed");
    });

    it("Should prevent transferring tokens", async function () {
      await adventurersCard.safeMint(addr1.address);
      
      await expect(
        adventurersCard.connect(addr1).transferFrom(addr1.address, owner.address, 0)
      ).to.be.revertedWith("Transfers not allowed");

      await expect(
        adventurersCard.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, owner.address, 0)
      ).to.be.revertedWith("Transfers not allowed");
    });
  });

  describe("Stat modifications", function () {

    it("Should prevent non-whitelisted address from modifying stats", async function () {
      await adventurersCard.safeMint(addr1.address);
      
      const newStats = {
        attack: 5,
        defense: 3,
        hp: 10,
        speed: 4,
        critChance: 2,
        evadeChance: 1,
        blockChance: 1,
        counterChance: 1
      };
      
      await expect(
        adventurersCard.connect(addr2).modifyStats(0, newStats)
      ).to.be.revertedWith("Not authorized to modify stats");
    });

    it("Should add new stats to existing stats", async function () {
      // Mint a token
      await adventurersCard.safeMint(addr1.address);
      await adventurersCard.setWhitelistStatus(addr2.address, true);
      
      // Get initial stats
      const initialStats = await adventurersCard.getCharacterStats(0);
      
      // Add stats
      const statChanges = {
        attack: 2,
        defense: 3,
        hp: 4,
        speed: 1,
        critChance: 1,
        evadeChance: 1,
        blockChance: 1,
        counterChance: 1
      };
      
      await adventurersCard.connect(addr2).modifyStats(0, statChanges);

      const updatedStats = await adventurersCard.getCharacterStats(0);
      expect(updatedStats.attack).to.equal(initialStats.attack + BigInt(statChanges.attack));
      expect(updatedStats.defense).to.equal(initialStats.defense + BigInt(statChanges.defense));
      expect(updatedStats.hp).to.equal(initialStats.hp + BigInt(statChanges.hp));
      // ... etc
    });
  });
});