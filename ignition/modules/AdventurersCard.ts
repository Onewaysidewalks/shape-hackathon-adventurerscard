// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AdventurersCardModule = buildModule("AdventurersCardModule", (m) => {

  const adventurersCard = m.contract("AdventurersCard");
  const battleEngine = m.contract("BattleEngine");

  return { adventurersCard, battleEngine };
});

export default AdventurersCardModule;
