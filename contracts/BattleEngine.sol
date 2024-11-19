// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdventurersCard.sol";

contract BattleEngine {
    AdventurersCard private immutable adventurersCard;

    uint256 constant MAX_TURNS = 20;

    event TurnCompleted(
        address attacker,
        address defender,
        uint256 damage,
        bool didCrit,
        bool didEvade,
        bool didBlock,
        bool didCounter
    );

    event BattleCompleted(
        address winner,
        address loser,
        uint256 turns,
        uint256 remainingHp
    );

    constructor(address _adventurersCardAddress) {
        adventurersCard = AdventurersCard(_adventurersCardAddress);
    }

    function battle(uint256 tokenId1, uint256 tokenId2) external {
        // Load character stats
        AdventurersCard.CharacterStats memory stats1 = adventurersCard.getCharacterStats(tokenId1);
        AdventurersCard.CharacterStats memory stats2 = adventurersCard.getCharacterStats(tokenId2);

        // Track current HP
        uint256 currentHp1 = stats1.hp;
        uint256 currentHp2 = stats2.hp;

        // Determine who goes first based on speed
        bool firstPlayerTurn = stats1.speed >= stats2.speed;
        uint256 turns = 0;

        

        // Battle until one player's HP reaches 0 or MAX_TURNS is reached
        while (currentHp1 > 0 && currentHp2 > 0 && turns < MAX_TURNS) {
            turns++;
            
            if (firstPlayerTurn) {
                currentHp2 = executeTurn(tokenId1, stats1, tokenId2, stats2, currentHp2);
            } else {
                currentHp1 = executeTurn(tokenId2, stats2, tokenId1, stats1, currentHp1);
            }

            firstPlayerTurn = !firstPlayerTurn;
        }

        // Determine winner - if MAX_TURNS reached, player with more HP wins
        address winner;
        address loser;
        uint256 remainingHp;

        if (turns >= MAX_TURNS) {
            if (currentHp1 > currentHp2) {
                winner = adventurersCard.ownerOf(tokenId1);
                loser = adventurersCard.ownerOf(tokenId2);
                remainingHp = currentHp1;
            } else {
                winner = adventurersCard.ownerOf(tokenId2);
                loser = adventurersCard.ownerOf(tokenId1);
                remainingHp = currentHp2;
            }
        } else {
            if (currentHp1 > 0) {
                winner = adventurersCard.ownerOf(tokenId1);
                loser = adventurersCard.ownerOf(tokenId2);
                remainingHp = currentHp1;
            } else {
                winner = adventurersCard.ownerOf(tokenId2);
                loser = adventurersCard.ownerOf(tokenId1);
                remainingHp = currentHp2;
            }
        }
        
        emit BattleCompleted(winner, loser, turns, remainingHp);
    }

    function executeTurn(
        uint256 attackerTokenId,
        AdventurersCard.CharacterStats memory attackerStats,
        uint256 defenderTokenId,
        AdventurersCard.CharacterStats memory defenderStats,
        uint256 defenderCurrentHp
    ) private returns (uint256) {
        // Roll for chances
        bool didCrit = checkProbability(attackerStats.critChance);
        bool didEvade = checkProbability(defenderStats.evadeChance);
        bool didBlock = checkProbability(defenderStats.blockChance);
        bool didCounter = checkProbability(defenderStats.counterChance);

        // Calculate damage
        uint256 damage = 0;

        if (!didEvade) {
            // Base damage
            damage = attackerStats.attack > defenderStats.defense ? 
                    attackerStats.attack - defenderStats.defense : 1;

            // Apply crit (2x damage)
            if (didCrit) {
                damage *= 2;
            }

            // Apply block (half damage)
            if (didBlock) {
                damage = damage / 2;
                if (damage == 0) damage = 1;
            }

            // Apply counter (take 30% of damage back)
            if (didCounter) {
                uint256 counterDamage = (damage * 30) / 100;
                uint256 attackerCurrentHp = adventurersCard.getCharacterStats(attackerTokenId).hp;
                if (counterDamage >= attackerCurrentHp) {
                    counterDamage = attackerCurrentHp - 1;
                }
            }
        }

        // Calculate new HP
        uint256 newHp = defenderCurrentHp > damage ? defenderCurrentHp - damage : 0;

        emit TurnCompleted(
            adventurersCard.ownerOf(attackerTokenId),
            adventurersCard.ownerOf(defenderTokenId),
            damage,
            didCrit,
            didEvade,
            didBlock,
            didCounter
        );

        return newHp;
    }

    function checkProbability(uint8 chance) private view returns (bool) {
        if (chance == 0) return false;
        if (chance >= 100) return true;
        
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % 100;
        
        return randomNumber < chance;
    }
}