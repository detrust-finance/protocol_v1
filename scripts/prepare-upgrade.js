const { loadPreviousDeployment, verifyContract } = require("./utils.js");
const { ethers, upgrades, network } = require("hardhat");
const envResult = require("dotenv").config();
if (envResult.error) {
  throw envResult.error;
}
const env = envResult.parsed;

const UPGRADE_ABI = [
  "function upgrade(address proxy, address implementation)",
  "function schedule(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt, uint256 delay)",
  "function execute(address target, uint256 value, bytes calldata data, bytes32 predecessor, bytes32 salt)",
];
const iface = new ethers.utils.Interface(UPGRADE_ABI);
async function main() {
  const deploymentState = loadPreviousDeployment(network.name);
  const DeTrust = await ethers.getContractFactory("DeTrust");
  console.log("Preparing upgrade...");
  const deTrust = await upgrades.prepareUpgrade(
    deploymentState.DeTrust.address,
    DeTrust
  );
  console.log("upgraded at:", deTrust);
  await verifyContract(deTrust);
  const data = iface.encodeFunctionData("upgrade", [
    deploymentState.DeTrust.address,
    deTrust,
  ]);
  const proxy_admin = require(`../.openzeppelin/${network.name}.json`).admin
    .address;
  console.log("upgraded data:", data);
  const schedule_data = iface.encodeFunctionData("schedule", [
    proxy_admin,
    0,
    data,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    env[`${network.name.toUpperCase()}_TIMELOCK_DELAY_SECONDS`],
  ]);
  console.log("schedule data:", schedule_data);
  const execute_data = iface.encodeFunctionData("execute", [
    proxy_admin,
    0,
    data,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  ]);
  console.log("execute data:", execute_data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
