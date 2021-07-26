async function main() {
  const proxyAddress = "0x719A8D43aE6418D6ea87E84BC6Cb3d2DEcA0BC91"; // This is the proxy address NOT the admin of the proxy.

  const DeTrust = await ethers.getContractFactory("DeTrust");
  console.log("Preparing upgrade...");
  const boxV2Address = await upgrades.prepareUpgrade(proxyAddress, BoxV2);
  const deTrust = await upgrades.prepareUpgrade(proxyAddress, DeTrust);
  console.log("upgraded at:", deTrust);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
