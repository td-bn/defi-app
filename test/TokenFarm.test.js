const { assert } = require('chai');

const StakeToken = artifacts.require("StakeToken");
const EarnToken = artifacts.require("EarnToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should();

const tokens = (n) => {
    return web3.utils.toWei(n,'ether');
}

contract('TokenFarm', (accounts) => {

    const [owner, investor] = accounts;
    let stakeToken, earnToken, tokenFarm;

    before(async () => {
        stakeToken = await StakeToken.new()
        earnToken = await EarnToken.new()
        tokenFarm = await TokenFarm.new(stakeToken.address, earnToken.address)

        // Mock Transfer
        await earnToken.transfer(tokenFarm.address, tokens('1000000'));
        await stakeToken.transfer(investor, tokens('100'), {from: owner});
    });

    describe('StakeToken deployment', async() => {
        it('should have a name', async() => {
            const name = await stakeToken.name();
            assert.equal(name, 'Stake Token');
        });
    })

    describe('EarnToken deployment', async() => {
        it('should have a name', async() => {
            const name = await earnToken.name();
            assert.equal(name, 'Earn Token');
        });

    })

    describe('Token Farm', async() => {
        it('should have a name', async() => {
            const name = await tokenFarm.name();
            assert.equal(name, 'TokenFarm');
        })

        it('should have tokens', async() => {
            const balance = await earnToken.balanceOf(tokenFarm.address);
            assert.equal(balance, tokens('1000000'));
        });
    });

    describe('Investor', async() => {
        it('should have stake tokens', async () => {
            const balance = await stakeToken.balanceOf(investor);
            assert.equal(balance, tokens('100'));
        });
    });

    describe('Yield Farming', async() => {
        it('should stake, unstake and reward users', async() => {
            // Staking tokens
            let balance = await stakeToken.balanceOf(investor);
            assert.equal(balance, tokens('100'));
 
            await stakeToken.approve(tokenFarm.address, tokens('100'), {from: investor});
            await tokenFarm.stakeTokens(tokens('100'), {from: investor});

            const afterBalance = await stakeToken.balanceOf(investor);
            assert.equal(afterBalance, tokens('0'));

            let stakingBalance = await stakeToken.balanceOf(tokenFarm.address);
            assert.equal(stakingBalance, tokens('100'));

            // Note mapping is accessed like a function from a different contract
            let stakingStatus = await tokenFarm.isStaking(investor);
            assert.equal(stakingStatus, true);

            // Issue rewards
            await tokenFarm.issueRewards({from: owner});
            
            const rewardBalance = await earnToken.balanceOf(investor);
            assert.equal(rewardBalance.toString(), tokens('100'), 'investor should be rewarded the correct amount of earn token');

            await tokenFarm.issueRewards({from: investor}).should.be.rejected;


            // Unstaking tokens
            await tokenFarm.unstakeTokens({from: investor});

            balance = await stakeToken.balanceOf(investor);
            assert.equal(balance, tokens('100'), 'investor should have the correct balance after unstaking')

            balance = await stakeToken.balanceOf(tokenFarm.address);
            assert.equal(balance, tokens('0'), 'token farm should have the correct balance after unstaking')

            stakingStatus = await tokenFarm.isStaking(investor);
            assert.equal(stakingStatus, false, 'staking status should be false after unstaking');

            stakingBalance = await tokenFarm.stakingBalance(investor);
            assert.equal(stakingBalance, tokens('0'), 'staking balance should be updated after unstaking');
        });
    });
});