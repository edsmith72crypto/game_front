import React, { Component } from 'react';
import pickaxe from '../images/pickaxe.png';
import gpu from '../images/gpu.png';
import mainBackground from '../images/backgroundBlank.png';

class Game extends Component {
  constructor(props){
    super(props);
    
    // Totals
    this.total = 0;
    this.totalBalance = 0;
    this.totalClicked = 0;

    // Incrementers and modifiers
    this.multiplier = 1000;
    this.increment = 0;
    this.incrementClick = 1;

    // Building costs
    this.buildingCosts = []
    this.buildingCosts[0] = 1;
    this.buildingCosts[1] = 10;

    //Building counts
    this.totalBuildings = 2;
    this.buildingCounts = [];
    for(var i = 0; i < this.totalBuildings; i++){
      this.buildingCounts[i] = 0;
    }

    this.maxSafe = Number.MAX_SAFE_INTEGER;

    this.gameTimerInverval = 1000;
    this.gameTimer = null;
    
    this.updateDisplay = this.updateDisplay.bind(this)
    this.gameLoop = this.gameLoop.bind(this)
    this.updateBuildingCosts = this.updateBuildingCosts.bind(this)
    this.updateBuildingCounts = this.updateBuildingCounts.bind(this)
  }
  
  componentDidMount() {
    this.gameTimer = window.setInterval(this.gameLoop, this.gameTimerInverval);

    this.gameLoop();
  }

  gameLoop(){
    this.updateDisplay();
  }

  miningClick(){
    var _inc = (this.incrementClick * (this.multiplier / 1000));
    this.total += _inc;
    this.totalClicked += _inc;
    this.totalBalance += _inc;
    this.updateDisplay();
  }

  updateDisplay(){
    document.getElementById("coinBalanceDisplay").innerText = this.totalBalance.toString();

    
    document.getElementById("coinBalance").innerText = this.totalBalance.toString();
    document.getElementById("coinTotal").innerText = this.total.toString();
    document.getElementById("coinsManual").innerText = this.totalClicked.toString();
    this.updateBuildingCosts();
    this.updateBuildingCounts();
  }

  updateBuildingCosts(){
    for(var i = 0; i < this.totalBuildings; i++){
      document.getElementById("building"+i.toString()+"Cost").innerText = this.buildingCosts[i].toString();
    }
  }

  updateBuildingCounts(){
    for(var i = 0; i < this.totalBuildings; i++){
      document.getElementById("building"+i.toString()+"Purchased").innerText = this.buildingCounts[i].toString();
    }
  }

  buildingPurchase(_id){
    if(this.buildingCosts[_id] > this.totalBalance){
      return;
    }

    this.totalBalance -= this.buildingCosts[_id];
    this.buildingCosts[_id] += 5;
    this.buildingCounts[_id]++;

    
    document.getElementById("coinBalanceDisplay").innerText = this.totalBalance.toString();
    document.getElementById("building"+_id.toString()+"Cost").innerText = this.buildingCosts[_id].toString();
    //document.getElementById("building"+_id.toString()+"Purchased").innerText = this.buildingCounts[_id].toString();
  }

  render() {
    return (
      <div id="content" className="row">
        <div id="statsColumn" className="column leftGameColumn2">
          <p>Coins mined: <span id="coinTotal"></span><br/>
            Coins in wallet: <span id="coinBalance"></span><br/>
            Coins manually mined: <span id="coinsManual"></span><br/>
            Pickaxes purchased: <span id="building0Purchased"></span><br/>
            Miners purchased: <span id="building1Purchased"></span></p>
        </div>
        <div id="clickColumn" className="column centreGameColumn2">
          <p className="displayHeader"><span id="coinBalanceDisplay"></span><br/>coins</p>
          <div className="clickerDiv">
            <img id="pickaxe" src={pickaxe} className="pickaxeImage imageRotate" alt="clicky" onClick={(event) => {
              event.preventDefault();
              this.miningClick();
            }}/><img id="gpu" src={gpu} className="gpuImage" alt="smashy" />
          </div>
        </div>
        <div id="buildingColumn" className="column rightGameColumn2">
          <div id="buildingPickaxe" className="buildingPurchase" onClick={(event) => {
              this.buildingPurchase(0);
            }}>
            <div className="buildingContent">
              <div id="building0" className="buildingName">Pickaxe&nbsp;-&nbsp;<span id="building0Cost"></span>&nbsp;coins</div>
            </div>
          </div>
          <div id="buildingMiner" className="buildingPurchase" onClick={(event) => {
              this.buildingPurchase(1);
            }}>
            <div className="buildingContent">
              <div id="building1" className="buildingName">Miner&nbsp;-&nbsp;<span id="building1Cost"></span>&nbsp;coins</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Game;