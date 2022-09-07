import React, { Component } from 'react';
//import IERC20 from '../abis/IERC20.json';
//import MasterMeerkat from '../abis/MasterMeerkat.json'

class Farms extends Component {
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

  updateZapperAllowance(_token){
    this.props.approveTokenZapperPoly(_token);
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

  updateInputField(_from, _to){
    document.getElementById(_to).value = document.getElementById(_from).innerHTML;
  }

  render() {
    return (
      <div id="content" className="modalPadding">
        <p className="farmTopButtons"><span onClick={this.props.closeFarmModal} className="customLink closeButton">Close</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span onClick={this.props.updatePoolInfo} className="customLink closeButton">Refresh farm info</span></p>
        <div className="row">
          <div className="column cell1">
            <p>MMF farm (MMF Polygon)</p>
            <p>Balance: <span id="mmfBalanceFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfBalanceFarm","depositMMFSingleValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[window.POLY_MMF_POOL_POS], "ether") }</span></p>
            <input
                  id="depositMMFSingleValue"
                  type="text"
                  ref={(input) => { this.depositMMFSingleValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[0] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(0);
            }}>Approve MMF</button> : <button id="mmfDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              if(this.depositMMFSingleValue.value === "" || this.depositMMFSingleValue.value === 0 || this.depositMMFSingleValue.value === "0"){
                return;
              }
              
              const _depositValue = (this.depositMMFSingleValue.value).toString();
              this.props.depositFarm(window.POLY_MMF_POOL_POS, _depositValue);
            }}>Deposit MMF</button>}<br/>
            <p>Staked LP: <span id="mmfStakedFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfStakedFarm","withdrawMMFValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenPoolBalance[window.POLY_MMF_POOL_POS], "ether") }</span><br/>
            Pending MMF: <span id="mmfPendingFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenPoolPending[window.POLY_MMF_POOL_POS], "ether") }</span></p>
            <input
                  id="withdrawMMFValue"
                  type="text"
                  ref={(input) => { this.withdrawMMFValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Withdraw" />
            
            <button id="mmfWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              if(this.withdrawMMFValue.value === "" || this.withdrawMMFValue.value === 0 || this.withdrawMMFValue.value === "0"){
                return;
              }

              const _withdrawValue = (this.withdrawMMFValue.value).toString()
              this.props.withdrawFarm(window.POLY_MMF_POOL_POS, _withdrawValue);
            }}>Withdraw MMF</button>
            <button id="mmfClaimRewardsButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              this.props.claimRewardsFarm(window.POLY_MMF_POOL_POS);
            }}>Claim rewards</button><br/>
          </div>
          <div className="column cell2">
            <p>MMF-WMATIC farm (MMF Polygon)</p>
            <div>
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
                { this.props.polyTokenZapperAllowance[0] <= 0 ? <button id="mmfApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateZapperAllowance(0);
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
            <p>Balance: <span id="mmfWmaticBalanceFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfWmaticBalanceFarm","depositMMFWMATICValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[window.POLY_MMF_WMATIC_POOL_POS], "ether") }</span></p>
            <input
                  id="depositMMFWMATICValue"
                  type="text"
                  ref={(input) => { this.depositMMFWMATICValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[2] <= 0 ? <button id="mmfWmaticApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(2);
            }}>Approve MMF-WMATIC</button> : <button id="mmfWmaticDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              if(this.depositMMFWMATICValue.value === "" || this.depositMMFWMATICValue.value === 0 || this.depositMMFWMATICValue.value === "0"){
                return;
              }
              
              const _depositValue = (this.depositMMFWMATICValue.value).toString();
              this.props.depositFarm(window.POLY_MMF_WMATIC_POOL_POS, _depositValue);
            }}>Deposit MMF-WMATIC</button>}<br/>
            <p>Staked LP: <span id="mmfWmaticStakedFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfWmaticStakedFarm","withdrawMMFWMATICValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenPoolBalance[window.POLY_MMF_WMATIC_POOL_POS], "ether") }</span><br/>
            Pending MMF: <span id="mmfWmaticPendingFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenPoolPending[window.POLY_MMF_WMATIC_POOL_POS], "ether") }</span></p>
            <input
                  id="withdrawMMFWMATICValue"
                  type="text"
                  ref={(input) => { this.withdrawMMFWMATICValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Withdraw" />
            <button id="mmfWmaticWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              if(this.withdrawMMFWMATICValue.value === "" || this.withdrawMMFWMATICValue.value === 0 || this.withdrawMMFWMATICValue.value === "0"){
                return;
              }
              
              const _withdrawValue = (this.withdrawMMFWMATICValue.value).toString()
              this.props.withdrawFarm(window.POLY_MMF_WMATIC_POOL_POS, _withdrawValue);
            }}>Withdraw MMF</button>
            <button id="mmfWmaticClaimRewardsButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              this.props.claimRewardsFarm(window.POLY_MMF_WMATIC_POOL_POS);
            }}>Claim rewards</button><br/><br/>
          </div>
          <div className="column cell3">
            <p>MMF-USDC farm (MMF Polygon)</p>
            <div>
              <div className="divInline">
                <input
                    id="usdcZapAmount"
                    type="text"
                    ref={(input) => { this.usdcZapAmount = input }}
                    className="form-control inputFieldWidth"
                    defaultValue=""
                    placeholder="Zap in with USDC" />
                { this.props.polyTokenZapperAllowance[3] <= 0 ? <button id="usdcApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateZapperAllowance(3);
                }}>Approve USDC</button> : <button id="mmfUsdcZapUsdcButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  if(this.usdcZapAmount.value === "" || this.usdcZapAmount.value === 0 || this.usdcZapAmount.value === "0"){
                    return;
                  }

                  const _zapValue = (this.usdcZapAmount.value).toString()
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
                { this.props.polyTokenZapperAllowance[0] <= 0 ? <button id="mmf2ApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                  event.preventDefault();
                  this.updateZapperAllowance(0);
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
            <p>Balance: <span id="mmfUsdcBalanceFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfUsdcBalanceFarm","depositMMFUSDCValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenBalance[window.POLY_MMF_USDC_POOL_POS], "ether") }</span></p>
            <input
                  id="depositMMFUSDCValue"
                  type="text"
                  ref={(input) => { this.depositMMFUSDCValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Deposit" />
            { this.props.polyTokenMasterAllowance[4] <= 0 ? <button id="mmfUsdcApproveButton" type="button" className="btn btn-primary" onClick={(event) => {
                event.preventDefault();
                this.updateAllowance(4);
            }}>Approve MMF-USDC</button> : <button id="mmfUsdcDepositButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              const _depositValue = (this.depositMMFUSDCValue.value).toString();
              this.props.depositFarm(window.POLY_MMF_USDC_POOL_POS, _depositValue);
            }}>Deposit MMF-USDC</button>}<br/>
            <p>Staked LP: <span id="mmfUsdcStakedFarm" className="customLink" onClick={(event) => {this.updateInputField("mmfUsdcStakedFarm","withdrawMMFUSDCValue");}}>{ this.props.web3.utils.fromWei(this.props.polyTokenPoolBalance[window.POLY_MMF_USDC_POOL_POS], "ether") }</span><br/>
            Pending MMF: <span id="mmfUsdcPendingFarm">{ this.props.web3.utils.fromWei(this.props.polyTokenPoolPending[window.POLY_MMF_USDC_POOL_POS], "ether") }</span></p>
            <input
                  id="withdrawMMFUSDCValue"
                  type="text"
                  ref={(input) => { this.withdrawMMFUSDCValue = input }}
                  className="form-control inputFieldWidth"
                  defaultValue=""
                  placeholder="Withdraw" />
            <button id="mmfUsdcWithdrawButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              if(this.withdrawMMFUSDCValue.value === "" || this.withdrawMMFUSDCValue.value === 0 || this.withdrawMMFUSDCValue.value === "0"){
                return;
              }

              const _withdrawValue = (this.withdrawMMFUSDCValue.value).toString()
              this.props.withdrawFarm(window.POLY_MMF_USDC_POOL_POS, _withdrawValue);
            }}>Withdraw MMF</button>
            <button id="mmfWUsdcClaimRewardsButton" type="button" className="btn btn-primary" onClick={(event) => {
              event.preventDefault();
              this.props.claimRewardsFarm(window.POLY_MMF_USDC_POOL_POS);
            }}>Claim rewards</button><br/><br/>
          </div>
        </div>
      </div>
    );
  }
}

export default Farms;