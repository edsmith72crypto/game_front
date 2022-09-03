import React, { Component } from 'react';
//import IERC20 from '../abis/IERC20.json';
//import MasterMeerkat from '../abis/MasterMeerkat.json'

class Vaults extends Component {
  constructor(props) {
    super(props);

    this.loading = true;
    this.mmfUsdcStaked = 0;
    this.mmfAddrPoly = "0x22a31bD4cB694433B6de19e0aCC2899E553e9481"
    this.mmfAllowance = 0;
  }

  async onLoadRun(){
    /*console.log("vault load" + allowance.toString());
    const mmfToken = new this.props.web3.eth.Contract(IERC20.abi, this.mmfAddrPoly);
    const allowance = await mmfToken.methods.allowance(this.props.account, this.props.vaultContractAddr).call();
    console.log("vault " + allowance.toString());
    this.setState({ mmfAllowance: allowance });
    if(allowance != 0){
      document.getElementById("mmfApproveButton").disabled = true;
      document.getElementById("mmfApproveButton").style.visibility = "hidden";
      document.getElementById("mmfDepositButton").disabled = false;
      document.getElementById("mmfDepositButton").style.visibility = "";
    }
    else{
      document.getElementById("mmfApproveButton").disabled = false;
      document.getElementById("mmfApproveButton").style.visibility = "";
      document.getElementById("mmfDepositButton").disabled = true;
      document.getElementById("mmfDepositButton").style.visibility = "hidden";
    }*/
  }

  async componentDidMount() {
    this.loading = false;
  }

  async updatePendingMMF(){
    //const mmfMaster = new this.props.web3.eth.Contract(MasterMeerkat.abi, this.props.masterMeerkat);
    var pendingMMF = await this.props.mmfMaster.methods.pendingMeerkat(this.props.mmfUsdcPoolId, this.props.account).call();
    document.getElementById("mffUsdcPending").innerHTML = (pendingMMF/(10 ** 18)).toString();
    console.log(pendingMMF);
  }

  async updateStakedMMFUSDC(){
    var stakedLP = await this.props.mmfMaster.methods.userInfo(this.props.mmfUsdcPoolId, this.props.account).call();
    this.mmfUsdcStaked = stakedLP["amount"];
    //document.getElementById("mffUsdcStaked").innerHTML = (stakedLP["amount"]/(10 ** 18)).toString();
    console.log(stakedLP["amount"]);
  }

  async updateStakedMMFMATIC(){
    var stakedLP = await this.props.mmfMaster.methods.userInfo(this.props.mmfUsdcPoolId, this.props.account).call();
    this.mmfUsdcStaked = stakedLP["amount"];
    //document.getElementById("mffUsdcStaked").innerHTML = (stakedLP["amount"]/(10 ** 18)).toString();
    console.log(stakedLP["amount"]);
  }

  async withdrawMMFUSDC(_amount){
    //var _amount = document.getElementById("mffUsdcStaked");
    this.vaultWithdraw(7, _amount, this.props.account);
  }

  vaultWithdraw(_pid, _amount, _userAddr) {
    console.log("take shit");
    let transferAmount = window.web3.utils.toWei(_amount, "ether");
    this.loading = true;
    this.props.mmfMaster.methods.withdraw(_pid, transferAmount).send({ from: _userAddr })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.loading = false;
      console.log(receipt);
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.loading = false;
      }
      else{
        console.log(e.message)
        this.loading = false;
      }
    });
  }

  render() {
    return (
      <div id="content" onLoad={(event) => {this.onLoadRun()}}>
        <p>Vault</p>
        <p>Total available: <span id="totalMMFUSDC">0</span>&nbsp;<span onClick={(event) => {
            event.preventDefault()
            const _depositValue = document.getElementById("totalMMFUSDC").innerHTML;
            this.depositValue.value = _depositValue;
        }}>Max</span>&nbsp;&nbsp;&nbsp;&nbsp;<span onClick={(event) => {
          event.preventDefault()
          this.updateStakedMMFUSDC();
        }}>Stake total Poly</span>&nbsp;&nbsp;&nbsp;&nbsp;<span onClick={(event) => {
          event.preventDefault()
          this.updateStakedMMFUSDC();
        }}>Stake total Cronus</span>&nbsp;&nbsp;&nbsp;&nbsp;<span onClick={(event) => {
          event.preventDefault()
          this.updatePendingMMF();
        }}>Update profit</span></p>
        <input
              id="depositValue"
              type="text"
              ref={(input) => { this.depositValue = input }}
              className="form-control"
              placeholder="Deposit" />
        <button type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            const _depositValue = (this.depositValue.value).toString()
            this.props.depositVault(_depositValue);
        }}>Deposit</button><br/><br/>
        <p>Staked:&nbsp;<span id="mffUsdcStaked">0.0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;&nbsp;Profit:&nbsp;<span id="mffUsdcPending">0.0</span></p>
        <button type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            this.withdrawValue.value = (this.mmfUsdcStaked/(10 ** 18));
        }}>Max</button><input
              id="withdrawValue"
              type="text"
              ref={(input) => { this.withdrawValue = input }}
              className="form-control"
              placeholder="Withdraw" />
        <button type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            const _withdrawValue = (this.withdrawValue.value).toString();
            this.withdrawMMFUSDC(_withdrawValue);
        }}>Withdraw</button>
        <button type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            this.props.setApproval(0);
        }}>Allowance test</button><br/>
        <button type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            this.props.withdraw();
        }}>Withdraw contract</button><br/>
        <input
              id="depositMMFSingleValue"
              type="text"
              ref={(input) => { this.depositMMFSingleValue = input }}
              className="form-control"
              defaultValue="0"
              placeholder="Deposit" />
        <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
            event.preventDefault()
            this.props.approveTokenMasterPoly(0);
        }}>Approve MMF</button>
        <button id="mmfDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          const _depositValue = (this.depositMMFSingleValue.value).toString()
          this.props.depositFarm(0, _depositValue);
        }}>Deposit MMF</button>
        <button id="mmfPendingButton" type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          this.props.getPending(0);
        }}>Pending MMF</button>
        <button id="mmfWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
          event.preventDefault()
          const _depositValue = (this.depositMMFSingleValue.value).toString()
          this.props.withdrawFarm(0, _depositValue);
        }}>Withdraw MMF</button><br/>
      </div>
    );
  }
}

export default Vaults;