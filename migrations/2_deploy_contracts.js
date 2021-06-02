const StakeToken = artifacts.require("StakeToken");
const EarnToken = artifacts.require("EarnToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
    // Deploy stake token
    await deployer.deploy(StakeToken);
    const stakeToken = await StakeToken.deployed();

    // Deploy earn token
    await deployer.deploy(EarnToken);
    const earnToken = await EarnToken.deployed();

    // Deploy TokenFarm token
    await deployer.deploy(TokenFarm, stakeToken.address, earnToken.address);
    const tokenFarm = await TokenFarm.deployed();

    // NOTE: account[0] is the user who deploys the contracts when using Ganache
    // Transfer all EarnToken to TokenFarm
    await earnToken.transfer(tokenFarm.address, '100000000000000000000000');
    // Transfer StakeToken tokens to a user
    await stakeToken.transfer(accounts[1], '100000000000000000000');
};
