const { ethers, upgrades } = require("hardhat");
async function main() {
  const DeTrust = await ethers.getContractFactory("DeTrust");
  console.log("Deploying ...");
  const deTrust = await upgrades.deployProxy(DeTrust);
  await deTrust.deployed();
  console.log("Deployed to\n  proxy: ", deTrust.address);

  // [Expose implementation address in hardhat plugin](https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/313)
  // https://eips.ethereum.org/EIPS/eip-1967#logic-contract-address
  const implHex = await ethers.provider.getStorageAt(
    deTrust.address,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const logicAddress = ethers.utils.hexStripZeros(implHex);
  console.log("  logic: ", logicAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
