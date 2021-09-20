const { ethers, upgrades } = require("hardhat");
async function main() {
  const DeTrust = await ethers.getContractFactory("Test");
  console.log("Deploying ...");
  const deTrust = await DeTrust.deploy();
  await deTrust.deployed();
  console.log("Deployed to:", deTrust.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
