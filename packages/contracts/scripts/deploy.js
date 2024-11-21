import { ethers } from "hardhat";

async function main() {
  const AdventurersCard = await ethers.getContractFactory("AdventurersCard");
  const adventurersCard = await AdventurersCard.deploy();

  await adventurersCard.waitForDeployment();

  console.log("AdventurersCard deployed to:", await adventurersCard.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});