const { ethers, upgrades, network } = require("hardhat");
const {
  loadOrDeploy,
  loadPreviousDeployment,
  verifyContract,
} = require("./utils.js");
const envResult = require("dotenv").config();

if (envResult.error) {
  throw envResult.error;
}
const env = envResult.parsed;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const deploymentState = loadPreviousDeployment(network.name);

  console.log("Deploying ...");
  const DeTrust = await ethers.getContractFactory("DeTrust");
  deTrust = await loadOrDeploy(
    deployer,
    network.name,
    DeTrust,
    "DeTrust",
    deploymentState,
    [],
    true
  );
  console.log("Deployed to\n  proxy: ", deTrust.address);
  // // [Expose implementation address in hardhat plugin](https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/313)
  // // https://eips.ethereum.org/EIPS/eip-1967#logic-contract-address
  const implHex = await ethers.provider.getStorageAt(
    deTrust.address,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const logicAddress = ethers.utils.hexStripZeros(implHex);
  console.log("  logic: ", logicAddress);
  await verifyContract(logicAddress);

  const Timelock = await ethers.getContractFactory("TimelockController");
  timelock_args = [
    env[`${network.name}_TIMELOCK_DELAY_SECONDS`],
    JSON.parse(env[`${network.name.toUpperCase()}_TIMELOCK_PROPOSERS`]),
    JSON.parse(env[`${network.name.toUpperCase()}_TIMELOCK_EXECUTORS`]),
  ];
  timelock = await loadOrDeploy(
    deployer,
    network.name,
    Timelock,
    "TimelockController",
    deploymentState,
    timelock_args
  );
  console.log("Timelock address:", timelock.address);
  await verifyContract(timelock.address, timelock_args);
  const newOwnerOfTheProxyAdmin = timelock.address;
  console.log("Transferring ownership of ProxyAdmin to Timelock"); // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(newOwnerOfTheProxyAdmin);
  console.log("Ownership transferred to:", newOwnerOfTheProxyAdmin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
