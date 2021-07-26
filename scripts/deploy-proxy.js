const { ethers, upgrades } = require("hardhat");
async function main() {
  const DeTrust = await ethers.getContractFactory("DeTrust");
  console.log("Deploying ...");
  const deTrust = await upgrades.deployProxy(DeTrust);
  await deTrust.deployed();
  console.log("Deployed to:", deTrust.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
