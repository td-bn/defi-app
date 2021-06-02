const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {
    const tokenFarm = await TokenFarm.deployed();
    try {
        await tokenFarm.issueRewards();
        console.log('Issued tokens!');
    } catch (error) {
        console.log(error);
    }

    callback();
};