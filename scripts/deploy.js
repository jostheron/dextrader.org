const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("DexTraderFactory");
  const contract = await Contract.deploy("<Insert bot address here>");
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });