import React, { Component } from 'react'
import Navbar from './Navbar'
import Content from './Content'
import './App.css'
import StakeToken from '../abis/StakeToken.json'
import EarnToken from '../abis/EarnToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Web3 from 'web3'

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.getBlockChainData()
  }

  async getWeb3ContractAndBalance(contractJson, networkId, web3) {
    const contractData = contractJson.networks[networkId]
    try {
      const web3Contract = new web3.eth.Contract(contractJson.abi, contractData.address)
      const balance = await web3Contract.methods.balanceOf(this.state.account).call()
      return [web3Contract, balance.toString()]
    } catch (error) {
      console.log(error) 
    }
  }

  async getBlockChainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0],
    })
    // Get network id of connected network
    const networkId = await web3.eth.net.getId()
    
    const tokenFarmData = TokenFarm.networks[networkId]

    const [stakeToken, stakeTokenBalance] = await this.getWeb3ContractAndBalance(StakeToken, networkId, web3);
    const [earnToken, earnTokenBalance] = await this.getWeb3ContractAndBalance(EarnToken, networkId, web3);

    let tokenFarm, stakingBalance
    try {
      tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
    } catch (error) {
      console.log(error)
    }

    this.setState({
      stakeToken,
      stakeTokenBalance,
      earnToken,
      earnTokenBalance,
      tokenFarm,
      stakingBalance,
      loading: false
    })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum browser detected. Try installing meta-mask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({loading: true})
    try {
      this.state.stakeToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        console.log('Approved')
        this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false})
            window.location.reload()
        })
      })
    } catch (error) {
      console.log(error)
    }
  }

  unstakeTokens = (amount) => {
    this.setState({loading: true})
    try {
      this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
        window.location.reload()
      })
    } catch (error) {
      console.log(error)
    }
  }

  // stakeTokens = (amount) => {
  //   this.setState({ loading: true })
  //   this.state.stakeToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
  //     this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
  //       this.setState({ loading: false })
  //     })
  //   })
  // }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      loading: true
    }
  }

  render() {
    let content;
    if (this.state.loading) {
      content = <div id="loader" className="text-center">Loading...</div>
    } else {
      content = <Content 
        stakeTokenBalance={this.state.stakeTokenBalance}
        earnTokenBalance={this.state.earnTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://bnabi.glitch.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
