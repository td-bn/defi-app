import React, { Component } from 'react'
import dai from '../dai.png'

class Content extends Component {

  render() {

    return (
        <div id="content" className="mt-3">

            <table className="table table-boderless text-muted text-center">
                <thead>
                    <tr>
                        <th scope="col">Staking Balance</th>
                        <th scope="col">Reward Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'Ether')} tokens</td>
                        <td>{window.web3.utils.fromWei(this.props.earnTokenBalance, 'Ether')} tokens</td>
                    </tr>
                </tbody>
            </table>

            <div className="card mb-4">
                <div className="card-body">

                    <form className="mb-3" onSubmit={ (event)=> {
                        event.preventDefault()
                        let amount
                        amount = this.input.value.toString()
                        amount = window.web3.utils.toWei(amount, 'Ether')
                        this.props.stakeTokens(amount)
                    }}>

                        <div className="float-left">Stake Tokens</div>
                        <div className="float-right text-muted">
                            Balance: {window.web3.utils.fromWei(this.props.stakeTokenBalance, 'Ether')}
                        </div>

                        <div className="input-group mb-4">
                            <input 
                            ref={(input) => {this.input = input}}
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="0"
                            required />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <img src={dai} height="32" alt="" />
                                    &nbsp;&nbsp;&nbsp; mDai
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg">Stake</button>
                    </form>
                    <button  
                        type="submit"
                        className="btn btn-secondary btn-block btn-lg"
                        onClick={(event) => {
                            event.preventDefault()
                            this.props.unstakeTokens()
                        }}>
                        Un-Stake
                    </button>
                </div>
            </div>
        </div>
    );
  }
}

export default Content;
