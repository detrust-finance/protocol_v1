const { ethers, upgrades } = require("hardhat");
async function main() {
  // this will be the address of the TimeLock, as we need it to be the owner of the Proxy Admin.
  const newOwnerOfTheProxyAdmin = "0xE4D924daD589430Ee09B25B48c0FA982cB34367E";
  console.log("Transferring ownership of ProxyAdmin..."); // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(newOwnerOfTheProxyAdmin);
  console.log(
    "Transferred ownership of ProxyAdmin to:",
    newOwnerOfTheProxyAdmin
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
