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

  updateAllowance(_token){
    this.props.approveTokenMasterPoly(_token);
  }

  updateVogonAllowance(_token){
    this.props.approveTokenVogonPoly(_token);
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

  async updateStakedMMF(){
    var stakedLP = await this.props.mmfMaster.methods.userInfo(this.props.mmfUsdcPoolId, this.props.account).call();
    this.mmfUsdcStaked = stakedLP["amount"];
    //document.getElementById("mffUsdcStaked").innerHTML = (stakedLP["amount"]/(10 ** 18)).toString();
    console.log(stakedLP["amount"]);
  }

  render() {
    return (
      <div id="content">
        <div className="row">
          <div className="column cell1">
            <p>MMF farm (MMF Polygon)</p>
            <p>Available balance: <span id="mmfBalanceFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[0], "ether") }</span></p>
            <input
                  id="depositMMFSingleValue"
                  type="text"
                  ref={(input) => { this.depositMMFSingleValue = input }}
                  className="form-control"
                  defaultValue="0"
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[0] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(0);
            }}>Approve MMF</button> : <button id="mmfDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFSingleValue.value).toString();
              this.props.depositFarm(0, _depositValue);
            }}>Deposit MMF</button>}
            
            <button id="mmfPendingButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              this.props.getPending(0);
            }}>Pending MMF</button>
            <button id="mmfWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFSingleValue.value).toString()
              this.props.withdrawFarm(0, _depositValue);
            }}>Withdraw MMF</button><br/>
          </div>
          <div className="column cell2">
            <p>MMF-WMATIC farm (MMF Polygon)</p>
            <div>
              <p>Zap in!</p>
              <div className="divInline">
                <input
                    id="maticZapAmount"
                    type="text"
                    ref={(input) => { this.maticZapAmount = input }}
                    className="form-control inputFieldWidth"
                    defaultValue=""
                    placeholder="Zap in with MATIC" />
                <button id="mmfWmaticZapWmaticButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  if(this.maticZapAmount.value === "" || this.maticZapAmount.value === 0 || this.maticZapAmount.value === "0"){
                    return;
                  }

                  const _zapValue = (this.maticZapAmount.value).toString()
                  this.props.zapInToken(1, 2, _zapValue);
                }}>MATIC Zap</button>
              </div>
              <div className="divInline">
                <input
                    id="mmfZapAmount"
                    type="text"
                    ref={(input) => { this.mmfZapAmount = input }}
                    className="form-control inputFieldWidth"
                    defaultValue=""
                    placeholder="Zap in with MMF" />
                { this.props.polyTokenVogonAllowance[0] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateVogonAllowance(0);
                }}>Approve MMF</button> : <button id="mmfWmaticZapMmfButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  if(this.mmfZapAmount.value === "" || this.mmfZapAmount.value === 0 || this.mmfZapAmount.value === "0"){
                    return;
                  }

                  const _zapValue = (this.mmfZapAmount.value).toString()
                  this.props.zapInToken(0, 2, _zapValue);
                }}>MMF Zap</button>}
              </div>
            </div>
            <p>Available balance: <span id="mmfWmaticBalanceFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[2], "ether") }</span></p>
            <input
                  id="depositMMFWMATICValue"
                  type="text"
                  ref={(input) => { this.depositMMFSingleValue = input }}
                  className="form-control"
                  defaultValue="0"
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[2] <= 0 ? <button id="mmfWmaticApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(2);
            }}>Approve MMF-WMATIC</button> : <button id="mmfWmaticDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFSingleValue.value).toString();
              this.props.depositFarm(1, _depositValue);
            }}>Deposit MMF-WMATIC</button>}
            <button id="mmfWmaticWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFSingleValue.value).toString()
              this.props.withdrawFarm(1, _depositValue);
            }}>Withdraw MMF</button><br/><br/>
          </div>
          <div className="column cell3">
            <p>MMF-USDC farm (MMF Polygon)</p>
            <div>
              <p>Zap in!</p>
              <div className="divInline">
                <input
                    id="usdcZapAmount"
                    type="text"
                    ref={(input) => { this.maticZapAmount = input }}
                    className="form-control inputFieldWidth"
                    defaultValue=""
                    placeholder="Zap in with USDC" />
                { this.props.polyTokenVogonAllowance[3] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateVogonAllowance(3);
                }}>Approve USDC</button> : <button id="mmfWmaticZapWmaticButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  if(this.maticZapAmount.value === "" || this.maticZapAmount.value === 0 || this.maticZapAmount.value === "0"){
                    return;
                  }

                  const _zapValue = (this.maticZapAmount.value).toString()
                  this.props.zapInToken(3, 4, _zapValue);
                }}>USDC Zap</button>}
              </div>
              <div className="divInline">
                <input
                    id="mmf2ZapAmount"
                    type="text"
                    ref={(input) => { this.mmf2ZapAmount = input }}
                    className="form-control inputFieldWidth"
                    defaultValue=""
                    placeholder="Zap in with MMF" />
                { this.props.polyTokenVogonAllowance[0] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateVogonAllowance(0);
                }}>Approve MMF</button> : <button id="mmfUsdcZapMmfButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  if(this.mmf2ZapAmount.value === "" || this.mmf2ZapAmount.value === 0 || this.mmf2ZapAmount.value === "0"){
                    return;
                  }

                  const _zapValue = (this.mmf2ZapAmount.value).toString()
                  this.props.zapInToken(0, 4, _zapValue);
                }}>MMF Zap</button>}
              </div>
            </div>
            <p>Available balance: <span id="mmfUsdcBalanceFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[4], "ether") }</span></p>
            <input
                  id="depositMMFUSDCValue"
                  type="text"
                  ref={(input) => { this.depositMMFUSDCValue = input }}
                  className="form-control"
                  defaultValue="0"
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[4] <= 0 ? <button id="mmfUsdcApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(4);
            }}>Approve MMF-USDC</button> : <button id="mmfUsdcDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFUSDCValue.value).toString();
              this.props.depositFarm(2, _depositValue);
            }}>Deposit MMF-USDC</button>}
            <button id="mmfUsdcWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFUSDCValue.value).toString()
              this.props.withdrawFarm(2, _depositValue);
            }}>Withdraw MMF</button><br/><br/>
          </div>
        </div>
      </div>
    );
  }
}

export default Vaults;