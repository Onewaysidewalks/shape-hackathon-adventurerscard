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

    struct BattleResult {
        address winner;
        address loser;
        uint256 turns;
        uint256 winnerRemainingHp;
        uint256 loserRemainingHp;
    }

    function battle(
        uint256 tokenId1, 
        uint256 tokenId2, 
        uint256 maxTurns
    ) external returns (BattleResult memory) {
        // Load character stats
        AdventurersCard.CharacterStats memory stats1 = adventurersCard.getCharacterStats(tokenId1);
        AdventurersCard.CharacterStats memory stats2 = adventurersCard.getCharacterStats(tokenId2);

        // Track current HP
        uint256 currentHp1 = stats1.hp;
        uint256 currentHp2 = stats2.hp;

        // Determine who goes first based on speed
        bool firstPlayerTurn = stats1.speed >= stats2.speed;
        uint256 turns = 0;

        

        // Battle until one player's HP reaches 0 or maxTurns is reached
        while (currentHp1 > 0 && currentHp2 > 0 && turns < maxTurns) {
            turns++;
            
            if (firstPlayerTurn) {
                currentHp2 = executeTurn(tokenId1, stats1, tokenId2, stats2, currentHp2);
            } else {
                currentHp1 = executeTurn(tokenId2, stats2, tokenId1, stats1, currentHp1);
            }

            firstPlayerTurn = !firstPlayerTurn;
        }

        BattleResult memory result;
        result.turns = turns;

        if (turns >= maxTurns) {
            if (currentHp1 > currentHp2) {
                result.winner = adventurersCard.ownerOf(tokenId1);
                result.loser = adventurersCard.ownerOf(tokenId2);
                result.winnerRemainingHp = currentHp1;
                result.loserRemainingHp = currentHp2;
            } else {
                result.winner = adventurersCard.ownerOf(tokenId2);
                result.loser = adventurersCard.ownerOf(tokenId1);
                result.winnerRemainingHp = currentHp2;
                result.loserRemainingHp = currentHp1;
            }
        } else {
            if (currentHp1 > 0) {
                result.winner = adventurersCard.ownerOf(tokenId1);
                result.loser = adventurersCard.ownerOf(tokenId2);
                result.winnerRemainingHp = currentHp1;
                result.loserRemainingHp = currentHp2;
            } else {
                result.winner = adventurersCard.ownerOf(tokenId2);
                result.loser = adventurersCard.ownerOf(tokenId1);
                result.winnerRemainingHp = currentHp2;
                result.loserRemainingHp = currentHp1;
            }
        }
        
        emit BattleCompleted(
            result.winner, 
            result.loser, 
            result.turns, 
            result.winnerRemainingHp
        );

        return result;
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