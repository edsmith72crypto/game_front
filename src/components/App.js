import React, { Component } from 'react';
import ReactModal from 'react-modal';
import Navbar from './Navbar';
//import Main from './Main'
import Game from './Game';
import Farms from './Farms';
//import Vaults from './Vaults';
import './App.css';
import Web3 from 'web3';
import SlartiZapper from '../abis/SlartiZapper.json';
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
      polyTokenZapperAllowance: [],
      polyTokenBalance: [],
      polyTokenPoolBalance: [],
      polyTokenPoolPending: [],
      owner: '',
      loading: true,
      farmLoading: true,
      farmModal: false,
      mmfSinglePoolId: 0,
      masterMeerkatPoly: "0xa2B417088D63400d211A4D5EB3C4C5363f834764",
      meerkatRouterPoly: "0x51aBA405De2b25E5506DeA32A6697F450cEB1a17",
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

    this.pollingInterval = 3000;

    this.transferZapperUpdate = this.transferZapperUpdate.bind(this)
    this.transferMasterUpdate = this.transferMasterUpdate.bind(this)
    this.allowanceZapperUpdate = this.allowanceZapperUpdate.bind(this)
    this.allowanceMasterUpdate = this.allowanceMasterUpdate.bind(this)
    this.updatePoolInfo = this.updatePoolInfo.bind(this)
    this.closeFarmModal = this.closeFarmModal.bind(this)
    this.openFarmModal = this.openFarmModal.bind(this)
    this.deposit = this.deposit.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.approveTokenMasterCronos = this.approveTokenMasterCronos.bind(this)
    this.approveTokenMasterPoly = this.approveTokenMasterPoly.bind(this)
    this.approveTokenZapperPoly = this.approveTokenZapperPoly.bind(this)
    this.depositFarm = this.depositFarm.bind(this)
    this.claimRewardsFarm = this.claimRewardsFarm.bind(this)
    this.withdrawFarm = this.withdrawFarm.bind(this)
    this.getPending = this.getPending.bind(this)
    this.zapInToken = this.zapInToken.bind(this)

    this.zapperContractAddr = "0x6063bc19b6929842EEED2Eb42F614b245d959a65"; //Polygon mainnet
    
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
    
    window.POLY_MMF_POOL_POS = 0;
    window.POLY_MMF_WMATIC_POOL_POS = 1;
    window.POLY_MMF_USDC_POOL_POS = 2;
    this.polyLPTokenPool = []; //TODO this is off whack with the pool id master transfer timer
    this.polyLPTokenPool[window.POLY_MMF_WMATIC_POOL_POS] = 1; //MMF-MATIC LP is pool 1
    this.polyLPTokenPool[window.POLY_MMF_USDC_POOL_POS] = 2; //MMF-USDC LP is pool 2
    this.polyLPTokenPool[window.POLY_MMF_POOL_POS] = 0; //MMF staking is pool 0

    var i;
    for( i = 0; i < this.polyTokenAddress.length; i++){
      this.state.polyTokenMasterAllowance[i] = "0";
      this.state.polyTokenZapperAllowance[i] = "0";
      this.state.polyTokenBalance[i] = "0";
    }
    for(i = 0; i < this.polyLPTokenPool.length; i++){
      this.state.polyTokenPoolBalance[i] = "0";
      this.state.polyTokenPoolPending[i] = "0";
    }
    
    this.allowanceZapperTimer = null;
    this.allowanceZapperTimerPid = 0;
    this.allowanceMasterTimer = null;
    this.allowanceMasterTimerPid = 0;
    this.transferZapperTimer = null;
    this.transferZapperTimerPid = 0;
    this.transferMasterTimer = null;
    this.transferMasterTimerPid = 0;
  }

  openFarmModal(){
    this.setState({ farmModal: true });
  }

  closeFarmModal(){
    this.setState({ farmModal: false });
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
      }).on("connect", accounts => {
        if (accounts.length > 0){
          this.setState({ web3Connected: true });
          this.loadBlockchainData()
        }
        else
          this.setState({ web3Connected: false });
      }).on("disconnect", accounts => {
        this.setState({ loading: true});
        this.setState({ web3Connected: false });
        this.setState({ farmModal: false });
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
    if(networkId === 25) { //Cronos chain ID
      //Set up MasterMeerkat contract (farm)
      const mmfMaster = new web3.eth.Contract(MasterMeerkat.abi, this.state.masterMeerkat);
      this.setState({ mmfMaster });

      //Set up MeerkatRouter contract (exchange)
      const mmfRouter = new web3.eth.Contract(MeerkatRouter.abi, this.state.meerkatRouter);
      this.setState({ mmfRouter });

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
      window.alert('Cronos in progress.');

    } else if(networkId === 137) { //Polygon chain ID
      const slartiZapper = new web3.eth.Contract(SlartiZapper.abi, this.zapperContractAddr)
      this.setState({ slartiZapper })

      // Set up MasterMeerkat contract (farm)
      const mmfMaster = new web3.eth.Contract(MasterMeerkat.abi, this.state.masterMeerkatPoly);
      this.setState({ mmfMaster });

      // Set up MeerkatRouter contract (exchange)
      const mmfRouter = new web3.eth.Contract(MeerkatRouter.abi, this.state.meerkatRouterPoly);
      this.setState({ mmfRouter });

      // Name this place!
      const title = "Polygon Crypto Farmer";
      this.setState({ title: title });

      // Set up LPs
      /*const mmfMatic = new web3.eth.Contract(IBEP20.abi, this.polyTokenAddress[2]);
      this.setState({ mmfMatic });
      var mmfMaticBalance = await mmfMatic.methods.balanceOf(this.state.account).call();
      console.log("MMF-MATIC balance: "+mmfMaticBalance.toString());
      const stakedLP = await this.state.mmfMaster.methods.userInfo(this.state.mmfMaticPoolId, this.state.account).call();
      console.log("MMF-MATIC LP balance: "+stakedLP["amount"].toString());*/

      this.setState({ loading: false});
      
      // Get allowances and account balances
      var _polyTokenMasterAllowance = [];
      var _polyTokenZapperAllowance = [];
      var _polyTokenBalance = [];
      var i;
      for(i = 0; i < this.polyTokenAddress.length; i++){
        // Set up token contract
        this.polyTokenContract[i] = new web3.eth.Contract(IERC20.abi, this.polyTokenAddress[i]);
        // Get token balances
        _polyTokenBalance[i] = await this.polyTokenContract[i].methods.balanceOf(this.state.account).call();
        // Retrieve token allowances for the MasterMeerkat contract
        _polyTokenMasterAllowance[i] = await this.polyTokenContract[i].methods.allowance(this.state.account, this.state.masterMeerkatPoly).call();
        // Retrieve token allowances for the SlartiZapper contract
        _polyTokenZapperAllowance[i] = await this.polyTokenContract[i].methods.allowance(this.state.account, this.zapperContractAddr).call();
      }
      this.setState({ polyTokenMasterAllowance: _polyTokenMasterAllowance });
      this.setState({ polyTokenZapperAllowance: _polyTokenZapperAllowance });
      this.setState({ polyTokenBalance: _polyTokenBalance });

      // Get pool balances
      var _polyTokenPoolBalance = [];
      var _polyTokenPoolPending = [];
      for(i = 0; i < this.polyLPTokenPool.length; i++){
        // Get staked balance
        var poolResp = await this.state.mmfMaster.methods.userInfo(this.polyLPTokenPool[i], this.state.account).call();
        _polyTokenPoolBalance[i] = (poolResp["amount"]).toString();
        // Get pending balances
        _polyTokenPoolPending[i] = (await this.state.mmfMaster.methods.pendingMeerkat(this.polyLPTokenPool[i], this.state.account).call()).toString();
      }
      this.setState({ polyTokenPoolBalance: _polyTokenPoolBalance });
      this.setState({ polyTokenPoolPending: _polyTokenPoolPending });

      this.setState({ farmLoading: false})

      /*var mmfBalance = await this.polyTokenContract[3].methods.balanceOf(this.zapperContractAddr).call();
      console.log("Contract USDC: " + mmfBalance);
      mmfBalance = await this.polyTokenContract[4].methods.balanceOf(this.zapperContractAddr).call();
      console.log("Contract USDC LP: " + mmfBalance);
      mmfBalance = await this.polyTokenContract[0].methods.balanceOf(this.zapperContractAddr).call();
      console.log("Contract MMF: " + mmfBalance);*/
      //Get pending rewards
      //var pendingMMF = await mmfMaster.methods.pendingMeerkat(this.state.mmfMaticPoolId, this.state.account).call();
      //document.getElementById("totalMMFUSDC").innerHTML = pendingMMF;

    } else {
      window.alert('Switch to Polygon or Cronos networks.')
    }

  }

  async updatePoolInfo(){
    // Get account balances
    var _polyTokenBalance = [];
    var i;
    for(i = 0; i < this.polyTokenAddress.length; i++){
      _polyTokenBalance[i] = await this.polyTokenContract[i].methods.balanceOf(this.state.account).call();
    }
    this.setState({ polyTokenBalance: _polyTokenBalance });

    // Get pool balances
    var _polyTokenPoolBalance = [];
    var _polyTokenPoolPending = [];
    for(i = 0; i < this.polyLPTokenPool.length; i++){
      // Get staked balance
      var poolResp = await this.state.mmfMaster.methods.userInfo(this.polyLPTokenPool[i], this.state.account).call();
      _polyTokenPoolBalance[i] = (poolResp["amount"]).toString();
      // Get pending balances
      _polyTokenPoolPending[i] = (await this.state.mmfMaster.methods.pendingMeerkat(this.polyLPTokenPool[i], this.state.account).call()).toString();
    }
    this.setState({ polyTokenPoolBalance: _polyTokenPoolBalance });
    this.setState({ polyTokenPoolPending: _polyTokenPoolPending });
  }

  async transferZapperUpdate(){
    console.log("ping");
    var oldValue = this.state.polyTokenBalance[this.transferZapperTimerPid];
    var _polyTokenBalance = this.state.polyTokenBalance;
    _polyTokenBalance[this.transferZapperTimerPid] = (await this.polyTokenContract[this.transferZapperTimerPid].methods.balanceOf(this.state.account).call()).toString();
    this.setState({ polyTokenBalance: _polyTokenBalance });

    if(oldValue !== this.state.polyTokenBalance[this.transferZapperTimerPid]){
      window.clearInterval(this.transferZapperTimer);
      this.transferZapperTimer = null;
    }
  }

  async transferMasterUpdate(){
    console.log("ping");
    var oldValue = this.state.polyTokenPoolBalance[this.transferMasterTimerPid];
    var _polyTokenPoolBalance = this.state.polyTokenPoolBalance;
    var poolResp = await this.state.mmfMaster.methods.userInfo(this.polyLPTokenPool[this.transferMasterTimerPid], this.state.account).call();
    _polyTokenPoolBalance[this.transferMasterTimerPid] = (poolResp["amount"]).toString();
    this.setState({ polyTokenPoolBalance: _polyTokenPoolBalance });

    if(oldValue !== this.state.polyTokenPoolBalance[this.transferMasterTimerPid]){
      window.clearInterval(this.transferMasterTimer);
      this.transferMasterTimer = null;
    }
  }

  async allowanceZapperUpdate(){
    console.log("ping");
    var oldValue = this.state.polyTokenZapperAllowance[this.allowanceZapperTimerPid];
    var _polyTokenZapperAllowance = this.state.polyTokenZapperAllowance;
    _polyTokenZapperAllowance[this.allowanceZapperTimerPid] = await this.polyTokenContract[this.allowanceZapperTimerPid].methods.allowance(this.state.account, this.zapperContractAddr).call();
    this.setState({ polyTokenZapperAllowance: _polyTokenZapperAllowance });

    if(oldValue !== this.state.polyTokenZapperAllowance[this.allowanceZapperTimerPid]){
      window.clearInterval(this.allowanceZapperTimer);
      this.allowanceZapperTimer = null;
    }
  }

  async allowanceMasterUpdate(){
    console.log("ping");
    var oldValue = this.state.polyTokenMasterAllowance[this.allowanceMasterTimerPid];
    var _polyTokenMasterAllowance = this.state.polyTokenMasterAllowance;
    _polyTokenMasterAllowance[this.allowanceMasterTimerPid] = await this.polyTokenContract[this.allowanceMasterTimerPid].methods.allowance(this.state.account, this.state.masterMeerkatPoly).call();
    this.setState({ polyTokenMasterAllowance: _polyTokenMasterAllowance });

    if(oldValue !== this.state.polyTokenMasterAllowance[this.allowanceMasterTimerPid]){
      window.clearInterval(this.allowanceMasterTimer);
      this.allowanceMasterTimer = null;
    }
  }

  withdraw() {
    console.log("withdraw shit")
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");
    this.state.slartiZapper.methods.withdrawAll().send({ from: this.state.account, gasPrice: _gasPrice })
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

  // Deposit ETH into contract, y tho?
  deposit(_val) {
    console.log("deposit shit")
    let one_eth = window.web3.utils.toWei(_val, "ether");
    this.state.slartiZapper.methods.deposit(one_eth).send({ from: this.state.account, value: one_eth })
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
    // If not null, then a pending transaction is present
    if(this.transferMasterTimer != null){
      return;
    }

    console.log("deposit farm shit")
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");

    this.transferMasterTimer = window.setInterval(this.transferMasterUpdate, this.pollingInterval);
    this.transferMasterTimerPid = _pid;
    let _valWei = window.web3.utils.toWei(_val, "ether");
    this.state.mmfMaster.methods.deposit(this.polyLPTokenPool[_pid], _valWei, "0xeEe7B54b19547e16987726e3A222bDfde7fb0344").send({ from: this.state.account, gasPrice: _gasPrice })
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
      window.clearInterval(this.transferMasterTimer);
      this.transferMasterTimer = null;
    })
  }

  // Claim pending from MMF farm
  claimRewardsFarm(_pid) {
    // If not null, then a pending transaction is present
    if(this.transferMasterTimer != null){
      return;
    }

    console.log("claim farm shit")
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");

    this.transferMasterTimer = window.setInterval(this.transferMasterUpdate, this.pollingInterval);
    this.transferMasterTimerPid = _pid;
    this.state.mmfMaster.methods.deposit(this.polyLPTokenPool[_pid], "0", "0xeEe7B54b19547e16987726e3A222bDfde7fb0344").send({ from: this.state.account, gasPrice: _gasPrice })
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
      window.clearInterval(this.transferMasterTimer);
      this.transferMasterTimer = null;
    })
  }

  // Withdraw from MMF farm
  async withdrawFarm(_pid, _val) {
    // If not null, then a pending transaction is present
    if(this.transferMasterTimer != null){
      return;
    }

    // Check farm balance
    let _valWei = window.web3.utils.toWei(_val, "ether");
    var poolResp = await this.state.mmfMaster.methods.userInfo(this.polyLPTokenPool[_pid], this.state.account).call();
    if(poolResp["amount"] < _valWei){
      console.log("Insufficient balance");
      return;
    }

    this.transferMasterTimer = window.setInterval(this.transferMasterUpdate, this.pollingInterval);
    this.transferMasterTimerPid = _pid;
    
    console.log("withdraw farm shit")
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");

    this.state.mmfMaster.methods.withdraw(this.polyLPTokenPool[_pid], _valWei).send({ from: this.state.account, gasPrice: _gasPrice })
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
      window.clearInterval(this.transferMasterTimer);
      this.transferMasterTimer = null;
    })
  }

  // Zap in selected tokens
  zapInToken(_from, _to, _val) {
    // If not null, then a pending transaction is present
    if(this.transferZapperTimer != null){
      return;
    }

    console.log("zap shit")
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");

    this.transferZapperTimer = window.setInterval(this.transferZapperUpdate, this.pollingInterval);
    this.transferZapperTimerPid = _to;
    if(_from === 1){
      let _valWei = window.web3.utils.toWei(_val, "ether");
      this.state.slartiZapper.methods.zapInETH(this.polyTokenAddress[_to]).send({ from: this.state.account, value: _valWei, gasPrice: _gasPrice })
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
        window.clearInterval(this.transferZapperTimer);
        this.transferZapperTimer = null;
      })
    }
    else{
      var _valWei = 0;
      if(_from === 3){ //USDC only has 6 decimal places
        _valWei = window.web3.utils.toWei(_val, "picoether");
      }
      else{
        _valWei = window.web3.utils.toWei(_val, "ether");
      }
      this.state.slartiZapper.methods.zapInToken(this.polyTokenAddress[_from], _valWei, this.polyTokenAddress[_to]).send({ from: this.state.account, gasPrice: _gasPrice })
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
    
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");
    this.croTokenAddress[_token].methods.approve(this.state.masterMeerkat, approveAmount).send({ from: this.state.account, gasPrice: _gasPrice })
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
    // If not null, then a pending allowance is present
    if(this.allowanceMasterTimer != null){
      return;
    }

    console.log("approve meerkat polygon shit")
    let approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "ether");
    this.allowanceMasterTimer = window.setInterval(this.allowanceMasterUpdate, this.pollingInterval);
    this.allowanceMasterTimerPid = _token;
    
    const _gasPrice = window.web3.utils.toWei("50", "nanoether");
    this.polyTokenContract[_token].methods.approve(this.state.masterMeerkatPoly, approveAmount).send({ from: this.state.account, gasPrice: _gasPrice })
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
      window.clearInterval(this.allowanceMasterTimer);
      this.allowanceMasterTimer = null;
    })
  }

  approveTokenZapperPoly(_token) {
    // If not null, then a pending allowance is present
    if(this.allowanceZapperTimer != null){
      return;
    }
    
    console.log("approve polygon zapper shit")
    var approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "ether");
    if(_token === 3){ //USDC only has 6 decimal places
      approveAmount = window.web3.utils.toWei("1000000000000000000000000000000000000000000", "picoether");
    }
    this.allowanceZapperTimer = window.setInterval(this.allowanceZapperUpdate, this.pollingInterval);
    this.allowanceZapperTimerPid = _token;

    const _gasPrice = window.web3.utils.toWei("50", "nanoether");
    this.polyTokenContract[_token].methods.approve(this.zapperContractAddr, approveAmount).send({ from: this.state.account, gasPrice: _gasPrice })
    .once('confirmation', (confirmationNumber, receipt) => {
      console.log(receipt);
      var _polyTokenAllowance = this.polyTokenZapperAllowance;
      _polyTokenAllowance[_token] = approveAmount;
      this.setState({ polyTokenZapperAllowance: _polyTokenAllowance });
      console.log(this.polyTokenZapperAllowance[_token]);
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
      window.clearInterval(this.allowanceZapperTimer);
      this.allowanceZapperTimer = null;
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
                      <div className="">
                        <div className="links"><p><span onClick={this.openFarmModal} className="customLink">Farms</span></p></div>
                        <ReactModal isOpen={this.state.farmModal} contentLabel="Farm modal" >
                          {!this.state.farmLoading
                          ? <Farms account={this.state.account} mmfMaster={this.state.mmfMaster} masterMeerkat={this.state.masterMeerkat} web3={this.state.web3}
                            polyTokenMasterAllowance={this.state.polyTokenMasterAllowance} polyTokenZapperAllowance={this.state.polyTokenZapperAllowance}
                            polyTokenBalance={this.state.polyTokenBalance} polyTokenPoolPending={this.state.polyTokenPoolPending} polyTokenPoolBalance={this.state.polyTokenPoolBalance}
                            depositFarm={this.depositFarm} withdraw={this.withdraw} approveTokenMasterCronos={this.approveTokenMasterCronos} claimRewardsFarm={this.claimRewardsFarm}
                            approveTokenMasterPoly={this.approveTokenMasterPoly} getPending={this.getPending} approveTokenZapperPoly={this.approveTokenZapperPoly}
                            withdrawFarm={this.withdrawFarm} zapInToken={this.zapInToken} closeFarmModal={this.closeFarmModal} updatePoolInfo={this.updatePoolInfo}/>
                          : <div id="loader" className="text-center"><p className="text-center">Loading farms. Please wait...</p></div>}
                        </ReactModal>
                        <Game allowance={this.state.allowance} account={this.state.account} title={this.state.title}
                          polyTokenBalance={this.state.polyTokenBalance} polyTokenPoolPending={this.state.polyTokenPoolPending} polyTokenPoolBalance={this.state.polyTokenPoolBalance}/></div>
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
