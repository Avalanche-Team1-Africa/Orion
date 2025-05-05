const hre = require("hardhat");

async function main() {
    await hre.run('compile');

    const NSEShares = await hre.ethers.getContractFactory("NSEShares");
    const nSEShares = await NSEShares.deploy();
    await nSEShares.waitForDeployment();

    console.log("NSEShares Contract Address", await nSEShares.getAddress())
}

main().then( () => process.exit(0))
.catch( (error) => {
    console.error(error);
    process.exit(1);
});