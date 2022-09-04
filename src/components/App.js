import React, { Component } from 'react';
import Navbar from './Navbar';
//import Main from './Main'
import Game from './Game';
import Farms from './Farms';
import Vaults from './Vaults';
import Tabs from "./Tabs";
import './App.css';
import Web3 from 'web3';
import VogonRouter from '../abis/VogonRouter.json';
import MasterMeerkat from '../abis/MasterMeerkat.json';
import MeerkatRouter from '../abis/MeerkatRouter02.json';
import IBEP20 from '../abis/IBEP20.json';
import IERC20 from '../abis/IERC20.json';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      title: '',
      polyTokenMasterAllowance: [],
      polyTokenVogonAllowance: [],
      polyTokenBalance: [],
      owner: '',
      loading: true,
      farmLoading: true,
      mmfSinglePoolId: 0,
      masterMeerkatPoly: "0xa2B417088D63400d211A4D5EB3C4C5363f834764",
      meerkatRouterPoly: "0x51aBA405De2b25E5506DeA32A6697F450cEB1a17",
      mmfUsdcLpAddrPoly: "0x722f19bd9A1E5bA97b3020c6028c279d27E4293C",
      mmfMaticLpAddrPoly: "0xD15EB8710E28C23993968e671807d572189CC86e",
      mmfMaticPoolId: 1,
      masterMeerkat: "0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc",
      meerkatRouter: "0x145677FC4d9b8F19B5D56d1820c48e0443049a30",
      mmfUsdcLpAddr: "0x722f19bd9A1E5bA97b3020c6028c279d27E4293C",
      mmfUsdcPoolId: 7,
      mmfUsdcStaked: 0,
      mmfWcroLpAddr: "0xbA452A1c0875D33a440259B1ea4DcA8f5d86D9Ae",
      mmfWcroPoolId: 1,
      refAddr: "0xeEe7B54b19547e16987726e3A222bDfde7fb0344",
      web3Connected: false
    }

    this.deposit = this.deposit.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.approveTokenMasterCronos = this.approveTokenMasterCronos.bind(this)
    this.approveTokenMasterPoly = this.approveTokenMasterPoly.bind(this)
    this.approveTokenVogonPoly = this.approveTokenVogonPoly.bind(this)
    this.depositFarm = this.depositFarm.bind(this)
    this.withdrawFarm = this.withdrawFarm.bind(this)
    this.getPending = this.getPending.bind(this)
    this.zapInToken = this.zapInToken.bind(this)

    this.vaultContractAddr = "0x94b259E3c644500D3a32980a9054a7D60415Ab97"; //Ganache mainnet
    this.routerContractAddr = "0xDDA239E8cA03669b162fF4697846335478908d29"; //Ganache mainnet
    
    this.croTokenAddress = [];
    this.croTokenAddress[0] = "0x97749c9B61F878a880DfE312d2594AE07AEd7656"; //MMF (C)
    this.croTokenAddress[1] = "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"; //WCRO (C)

    // Supported tokens
    this.polyTokenTotal = 5;
    this.polyTokenAddress = [];
    this.polyTokenAddress[0] = "0x22a31bD4cB694433B6de19e0aCC2899E553e9481"; //MMF (P)
    this.polyTokenAddress[1] = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; //WMATIC (P)
    this.polyTokenAddress[2] = "0xD15EB8710E28C23993968e671807d572189CC86e"; //MMF-MATIC LP, pool 1
    this.polyTokenAddress[3] = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; //USDC (P)
    this.polyTokenAddress[4] = "0x8AB47799cB0d49aEB9E3a47c369813a3a3236790"; //MMF-USDC LP, pool 2
    this.polyTokenContract = [];

    for(var i = 0; i < this.polyTokenAddress.length; i++){
      this.state.polyTokenMasterAllowance[i] = 0;
      this.state.polyTokenVogonAllowance[i] = 0;
      this.state.polyTokenBalance[i] = 0;
    }
    
  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      var error = false
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable().catch(e => {
        if (e.code === -32002){
          console.log(e.message)
          error = true
        }
        else{
          console.log(e.message)
        }
      })

      if(!error){
        this.setState({ web3Connected: true });
      }

      window.ethereum.on("accountsChanged", accounts => {
        if (accounts.length > 0){
          this.setState({ web3Connected: true });
          this.loadBlockchainData()
        }
        else
          this.setState({ web3Connected: false });
      });
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected.')
    }
  }
  
  async loadBlockchainData() {
    
    const web3 = window.web3
    this.setState({ web3 });
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] }) //Gets the active account from their wallet

    const networkId = await web3.eth.net.getId()
    console.log(networkId);
    if(networkId === 25) { //Cronos chain ID
      //Set up MasterMeerkat contract (farm)
      const mmfMaster = new web3.eth.Contract(MasterMeerkat.abi, this.state.masterMeerkat);
      this.setState({ mmfMaster });

      //Set up MeerkatRouter contract (exchange)
      const mmfRouter = new web3.eth.Contract(MeerkatRouter.abi, this.state.meerkatRouter);
      this.setState({ mmfRouter });

      // Get blockchain native balance
      const balance = await web3.eth.getBalance(this.state.account);
      console.log("CRO Balance: " + balance);
      const title = "Cronos crypto clicker";
      this.setState({ title: title });

      //Set up LPs
      const mmfUsdc = new web3.eth.Contract(IBEP20.abi, this.state.mmfUsdcLpAddr);
      this.setState({ mmfUsdc });
      var mmfUsdcBalance = await mmfUsdc.methods.balanceOf(this.state.account).call();
      console.log("MMF-USDC balance: "+mmfUsdcBalance.toString());
      const stakedLP = await this.state.mmfMaster.methods.userInfo(this.state.mmfUsdcPoolId, this.state.account).call();
      this.setState({ mmfUsdcStaked: stakedLP });

      //Get pending rewards
      var pendingMMF = await mmfMaster.methods.pendingMeerkat(this.state.mmfUsdcPoolId, this.state.account).call();
      document.getElementById("totalMMFUSDC").innerHTML = pendingMMF;

      this.setState({ loading: false})
      this.setState({ farmLoading: false})

    } else if(networkId === 137) { //Polygon chain ID
      const vogonRouter = new web3.eth.Contract(VogonRouter.abi, this.routerContractAddr)
      this.setState({ vogonRouter })

      // Set up MasterMeerkat contract (farm)
      const mmfMaster = new web3.eth.Contract(MasterMeerkat.abi, this.state.masterMeerkatPoly);
      this.setState({ mmfMaster });

      // Set up MeerkatRouter contract (exchange)
      const mmfRouter = new web3.eth.Contract(MeerkatRouter.abi, this.state.meerkatRouterPoly);
      this.setState({ mmfRouter });

      // Name this place!
      const title = "Test Polygon Crypto Farmer";
      this.setState({ title: title });

      // Set up LPs
      const mmfMatic = new web3.eth.Contract(IBEP20.abi, this.state.mmfMaticLpAddrPoly);
      this.setState({ mmfMatic });
      var mmfMaticBalance = await mmfMatic.methods.balanceOf(this.state.account).call();
      console.log("MMF-MATIC balance: "+mmfMaticBalance.toString());
      const stakedLP = await this.state.mmfMaster.methods.userInfo(this.state.mmfMaticPoolId, this.state.account).call();
      this.setState({ mmfMaticStaked: stakedLP });
      console.log("MMF-MATIC LP balance: "+stakedLP["amount"].toString());
      
      var _polyTokenMasterAllowance = [];
      var _polyTokenVogonAllowance = [];
      var _polyTokenBalance = [];
      for(var i = 0; i < this.polyTokenAddress.length; i++){
        // Set up token contract
        this.polyTokenContract[i] = new web3.eth.Contract(IERC20.abi, this.polyTokenAddress[i]);
        // Get token balances
        _polyTokenBalance[i] = await this.polyTokenContract[i].methods.balanceOf(this.state.account).call();
        // Retrieve token allowances for the MasterMeerkat contract
        _polyTokenMasterAllowance[i] = await this.polyTokenContract[i].methods.allowance(this.state.account, this.state.masterMeerkatPoly).call();
        // Retrieve token allowances for the VogonRouter contract
        _polyTokenVogonAllowance[i] = await this.polyTokenContract[i].methods.allowance(this.state.account, this.routerContractAddr).call();
      }
      this.setState({ polyTokenMasterAllowance: _polyTokenMasterAllowance });
      this.setState({ polyTokenVogonAllowance: _polyTokenVogonAllowance });
      this.setState({ polyTokenBalance: _polyTokenBalance });

      this.setState({ loading: false});
      this.setState({ farmLoading: false})

      var mmfBalance = await this.polyTokenContract[3].methods.balanceOf(this.routerContractAddr).call();
      console.log("Contract USDC: " + mmfBalance);
      mmfBalance = await this.polyTokenContract[4].methods.balanceOf(this.routerContractAddr).call();
      console.log("Contract USDC LP: " + mmfBalance);
      mmfBalance = await this.polyTokenContract[0].methods.balanceOf(this.routerContractAddr).call();
      console.log("Contract MMF: " + mmfBalance);
      //Get pending rewards
      //var pendingMMF = await mmfMaster.methods.pendingMeerkat(this.state.mmfMaticPoolId, this.state.account).call();
      //document.getElementById("totalMMFUSDC").innerHTML = pendingMMF;

    } else {
      window.alert('Switch to Polygon or Cronos networks.')
    }

  }

  withdraw() {
    console.log("withdraw shit")
    this.state.vogonRouter.methods.withdrawAll(this.polyTokenAddress[0]).send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  // Deposit ETH into contract, why tho?
  deposit(_val) {
    console.log("deposit shit")
    let one_eth = window.web3.utils.toWei(_val, "ether");
    this.state.vogonRouter.methods.deposit(one_eth).send({ from: this.state.account, value: one_eth })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  // Deposit into MMF farm
  depositFarm(_pid, _val) {
    console.log("deposit farm shit")
    let _valWei = window.web3.utils.toWei(_val, "ether");
    this.state.mmfMaster.methods.deposit(_pid, _valWei, "0xeEe7B54b19547e16987726e3A222bDfde7fb0344").send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  // Withdraw from MMF farm
  withdrawFarm(_pid, _val) {
    console.log("withdraw farm shit")
    let _valWei = window.web3.utils.toWei(_val, "ether");
    this.state.mmfMaster.methods.withdraw(_pid, _valWei).send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  // Zap in selected tokens
  zapInToken(_from, _to, _val) {
    console.log("zap shit")
    if(_from === 1){
      let _valWei = window.web3.utils.toWei(_val, "ether");
      this.state.vogonRouter.methods.zapInETH(this.polyTokenAddress[_to]).send({ from: this.state.account, value: _valWei })
      .once('confirmation', (confirmationNumber, receipt) => {
        console.log(receipt);
        this.setState({ loading: false })
      }).catch(e => {
        if (e.code === 4001){
          console.log(e.message)
          this.setState({ loading: false })
        }
        else{
          console.log(e.message)
          this.setState({ loading: false })
        }
      })
    }
    else{
      let _valWei;
      if(_from === 3){ //USDC only has 6 decimal places
        _valWei = window.web3.utils.toWei(_val, "picoether");
      }
      else{
        _valWei = window.web3.utils.toWei(_val, "ether");
      }
      this.state.vogonRouter.methods.zapInToken(this.polyTokenAddress[_from], _valWei, this.polyTokenAddress[_to]).send({ from: this.state.account })
      .once('confirmation', (confirmationNumber, receipt) => {
        console.log(receipt);
        this.setState({ loading: false })
      }).catch(e => {
        if (e.code === 4001){
          console.log(e.message)
          this.setState({ loading: false })
        }
        else{
          console.log(e.message)
          this.setState({ loading: false })
        }
      })
    }
  }

  async getPending(_pid) {
    console.log("pend ding ding ding")
    const pending = await this.state.mmfMaster.methods.pendingMeerkat(_pid, this.state.account).call();
    console.log(pending);

    this.setState({ loading: false })
  }

  approveTokenMasterCronos(_token) {
    console.log("approve cronos shit")
    let approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "ether");
    
    this.croTokenAddress[_token].methods.approve(this.state.masterMeerkat, approveAmount).send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  approveTokenMasterPoly(_token) {
    console.log("approve meerkat polygon shit")
    let approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "ether");
    
    this.polyTokenContract[_token].methods.approve(this.state.masterMeerkatPoly, approveAmount).send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      console.log(receipt);
      var _polyTokenMasterAllowance = this.polyTokenMasterAllowance;
      _polyTokenMasterAllowance[_token] = approveAmount;
      this.setState({ polyTokenMasterAllowance: _polyTokenMasterAllowance });
      console.log(this.polyTokenMasterAllowance[_token]);
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  approveTokenVogonPoly(_token) {
    console.log("approve polygon shit")
    let approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "ether");
    
    this.polyTokenContract[_token].methods.approve(this.routerContractAddr, approveAmount).send({ from: this.state.account })
    .once('confirmation', (confirmationNumber, receipt) => {
      console.log(receipt);
      var _polyTokenAllowance = this.polyTokenVogonAllowance;
      _polyTokenAllowance[_token] = approveAmount;
      this.setState({ polyTokenVogonAllowance: _polyTokenAllowance });
      console.log(this.polyTokenVogonAllowance[_token]);
      this.setState({ loading: false })
    }).catch(e => {
      if (e.code === 4001){
        console.log(e.message)
        this.setState({ loading: false })
      }
      else{
        console.log(e.message)
        this.setState({ loading: false })
      }
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} title={this.state.title} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              <div className="plusCentre">
                { !this.state.web3Connected ?
                    <div id="loader" className="text-center plusCenter"><button type="button" className="btn btn-primary" onClick={(event) => {
                      event.preventDefault()
                      this.loadBlockchainData()
                    }}>Connect wallet</button><br/></div>
                    : this.state.loading
                      ? <div id="loader" className="text-center"><p className="text-center">Loading. Please wait...</p></div>
                      : 
                      <div className="plusCentre"><Tabs>
                        <div label="Game">
                        <Game allowance={this.state.allowance} account={this.state.account} title={this.state.title} />
                        </div>
                        <div label="Farms">
                        <Farms account={this.state.account} mmfMaster={this.state.mmfMaster} masterMeerkat={this.state.masterMeerkat} web3={this.state.web3}
                          polyTokenMasterAllowance={this.state.polyTokenMasterAllowance} polyTokenVogonAllowance={this.state.polyTokenVogonAllowance}
                          polyTokenBalance={this.state.polyTokenBalance}
                          depositFarm={this.depositFarm} withdraw={this.withdraw} approveTokenMasterCronos={this.approveTokenMasterCronos}
                          approveTokenMasterPoly={this.approveTokenMasterPoly} getPending={this.getPending} approveTokenVogonPoly={this.approveTokenVogonPoly}
                          withdrawFarm={this.withdrawFarm} zapInToken={this.zapInToken}/>
                        </div>
                        <div label="Vaults">
                        <Vaults allowance={this.state.allowance} account={this.state.account} title={this.state.title}
                          mmfMaster={this.state.mmfMaster} mmfUsdcPoolId={this.state.mmfUsdcPoolId} mmfUsdc={this.state.mmfUsdc} mmfUsdcStaked={this.state.mmfUsdcStaked}
                          masterMeerkat={this.state.masterMeerkat} web3={this.state.web3} mmfMaticPoolId={this.state.mmfMaticPoolId} mmfAllowance={this.state.mmfAllowance}
                          vaultContractAddr={this.vaultContractAddr}
                          depositFarm={this.depositFarm} withdraw={this.withdraw} approveTokenMasterCronos={this.approveTokenMasterCronos} approveTokenMasterPoly={this.approveTokenMasterPoly}
                          getPending={this.getPending}  withdrawFarm={this.withdrawFarm}/>
                        </div>
                        </Tabs></div>
                }
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
/*<Main accountVal={this.state.accountVal} allowance={this.state.allowance} thisAccount={this.state.account} title={this.state.title}
                        deposit={this.deposit} withdraw={this.withdraw} transferToken={this.transferToken} approveToken={this.approveToken} withdrawToken={this.withdrawToken}
                        mintTokens={this.mintTokens} />*/
export default App;
