const { ethers, upgrades} = require("hardhat");
const fs = require("fs");

async function loadOrDeploy(
  deployer,
  network,
  factory,
  name,
  deploymentState,
  params = [],
  proxy = false
) {
  if (deploymentState[name] && deploymentState[name].address) {
    console.log(
      `Using previously deployed ${name} contract at address ${deploymentState[name].address}`
    );
    return new ethers.Contract(
      deploymentState[name].address,
      factory.interface,
      deployer
    );
  }
  let contract;
  if (proxy) {
    contract = await upgrades.deployProxy(factory, ...params);
    await contract.deployed();
  } else {
    contract = await factory.deploy(...params);
  }

  deploymentState[name] = {
    address: contract.address,
    txHash: contract.deployTransaction.hash,
  };
  output_file = `./deployments/${network}.json`;
  saveDeployment(deploymentState, output_file);

  return contract;
}

function saveDeployment(deploymentState, output_file) {
  const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
  fs.writeFileSync(output_file, deploymentStateJSON);
}

function loadPreviousDeployment(network) {
  let previousDeployment = {};
  output_file = `./deployments/${network}.json`;
  if (fs.existsSync(output_file)) {
    console.log(`Loading previous deployment...`);
    previousDeployment = require("../" + output_file);
  }

  return previousDeployment;
}

async function verifyContract(address, constructorArguments) {
  hre = require("hardhat");
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments,
    });
  } catch (error) {
    // if it was already verified, it’s like a success, so let’s move forward and save it
    if (error.name != "NomicLabsHardhatPluginError") {
      console.error(`Error verifying: ${error.name}`);
      console.error(error);
    }
  }
}

module.exports = {
  verifyContract: verifyContract,
  loadOrDeploy: loadOrDeploy,
  loadPreviousDeployment: loadPreviousDeployment,
};
