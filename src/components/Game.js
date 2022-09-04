import React, { Component } from 'react';
import logo from '../myLogo.png';

class Game extends Component {
  constructor(props){
    super(props);
    
    this.total = 0;
    this.multiplier = 1000;
    this.increment = 1;
    this.maxSafe = Number.MAX_SAFE_INTEGER;
  }

  incrementCounter(){
    this.total = this.total + (this.increment * (this.multiplier / 1000));
    document.getElementById("clickTotal").innerText = this.total.toString();
    //console.log(this.total.toString());
  }

  render() {
    return (
      <div id="content">
        <img id="mainLogo" src={logo} className="App-logo" style={{width:100,height:100}} alt="clicky" onClick={(event) => {
          event.preventDefault();
          this.incrementCounter();
        }}/>
        <p>Total: <span id="clickTotal"></span></p>
      </div>
    );
  }
}

export default Game;