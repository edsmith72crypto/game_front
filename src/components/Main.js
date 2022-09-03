import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <input
              id="transferValue"
              type="text"
              ref={(input) => { this.transferValue = input }}
              className="form-control"
              placeholder="Value" />
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          const _transVal = (this.transferValue.value).toString()
          this.props.deposit(_transVal)
        }}>Deposit</button><br/>
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          this.props.withdraw()
        }}>Withdraw</button><br/>
        {this.props.allowance.toString() === "0" ?
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          this.props.approveToken(0)
        }}>Approve shit</button> :
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          const _transVal = (this.transferValue.value).toString()
          this.props.transferToken(0, _transVal)
        }}>Send shit</button>}<br/>
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          this.props.withdrawToken(0)
        }}>Withdraw tokens</button><br/>
        <button type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          const _transVal = (this.transferValue.value).toString()
          this.props.mintTokens(0, _transVal)
        }}>Mint tokens</button>
      </div>
    );
  }
}

export default Main;