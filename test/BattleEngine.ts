import { expect } from "chai";
import { ethers } from "hardhat";
import { AdventurersCard, BattleEngine } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BattleEngine", function () {
    let adventurersCard: AdventurersCard;
    let battleEngine: BattleEngine;
    let owner: SignerWithAddress;
    let player1: SignerWithAddress;
    let player2: SignerWithAddress;

    beforeEach(async function () {
        [owner, player1, player2] = await ethers.getSigners();

        const AdventurersCard = await ethers.getContractFactory("AdventurersCard");
        adventurersCard = await AdventurersCard.deploy();

        const BattleEngine = await ethers.getContractFactory("BattleEngine");
        battleEngine = await BattleEngine.deploy(await adventurersCard.getAddress());

        // Mint cards for testing
        await adventurersCard.safeMint(player1.address);
        await adventurersCard.safeMint(player2.address);
    });

    describe("Battle", function () {
        it("Should execute a battle between two cards", async function () {
            const tx = await battleEngine.battle(0, 1);
            const receipt = await tx.wait();
            
            // Get the BattleCompleted event from the receipt
            const battleCompletedEvent = receipt?.logs.find(
                log => {
                    try {
                        return battleEngine.interface.parseLog(log)?.name === "BattleCompleted";
                    } catch {
                        return false;
                    }
                }
            );
            
            const eventArgs = battleEngine.interface.parseLog(battleCompletedEvent)?.args;
            
            // Add debug logging
            console.log("Battle Event Args:", {
                winner: eventArgs?.winner,
                loser: eventArgs?.loser,
                turns: eventArgs?.turns,
                remainingHp: eventArgs?.remainingHp
            });
            
            // Since both cards have the same stats, player1 should win due to going first
            // (because tokenId 0 was minted first)
            expect(eventArgs?.winner).to.equal(player1.address);
            expect(eventArgs?.loser).to.equal(player2.address);
            expect(eventArgs?.turns).to.be.equal(1);
        });

        it("Should emit TurnCompleted events", async function () {
            await expect(battleEngine.battle(0, 1))
                .to.emit(battleEngine, "TurnCompleted");
        });

        it("Should emit BattleCompleted event", async function () {
            await expect(battleEngine.battle(0, 1))
                .to.emit(battleEngine, "BattleCompleted");
        });

        it("Should complete battle within gas limits", async function () {
            const tx = await battleEngine.battle(0, 1);
            const receipt = await tx.wait();
            
            console.log("Gas used:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lt(ethers.parseUnits("3000000", "gwei")); // adjust limit as needed
        });
    });
}); 