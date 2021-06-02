pragma solidity ^0.5.0;

/*
User's stake StakeToken and earn EarnToken
*/

// Import tokens
import "./StakeToken.sol";
import "./EarnToken.sol";

contract TokenFarm {
    //  public variables can be accessed from outside the smart contract
    string public name = "TokenFarm";
    address owner;

    StakeToken public stakeToken;
    EarnToken public earnToken;


    // Staking related
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address[] public stakers;

    constructor(StakeToken _stakeToken, EarnToken _earnToken) public {
        stakeToken = _stakeToken;
        earnToken = _earnToken;
        owner = msg.sender;
    }

    // Stake tokens
    function stakeTokens(uint amount) public {
        require(amount > 0, 'Amount must be greater than 0');
        // Transfer to Token Farm --- Stake
        stakeToken.transferFrom(msg.sender, address(this), amount);

        // Default value of unint is 0
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + amount;

        // Add to stakers if first time staker
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking statuses
        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // Withdraw tokens
    function unstakeTokens() public {
        // Get staked amount
        uint amount = stakingBalance[msg.sender];
        require(amount > 0, 'staking balance should be greater than zero');

        // Transfer back to user
        stakeToken.transfer(msg.sender, amount);

        // Update balance and status
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    // Issue rewards
    function issueRewards() public {
        require(msg.sender == owner, 'caller must be owner');
        for (uint i=0; i<stakers.length; i++) {
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            if (balance > 0)
                earnToken.transfer(stakers[i], balance);
        }
    }
}