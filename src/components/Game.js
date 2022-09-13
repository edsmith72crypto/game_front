import React, { Component } from 'react';
import groundTileMap from '../images/groundTiles.png';
import itemTileMap from '../images/items.png';
import overlayTileMap from '../images/overlay.png';

class Game extends Component {
  constructor(props){
    super(props);

    // Canvas 2D context
    this.ctx = "";
    this.map = {};
    this.itemMap = {};
    this.overlayMap = {};
    this.groundTiles = "";
    this.itemTiles = "";
    this.overlayTiles = "";
    this.alphabetTiles = "";
    this.MOUSE_GRID_COLOUR = 63;
    this.gameLoaded = false;
    
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
    
    this.updateDisplay = this.updateDisplay.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    //this.updateBuildingCosts = this.updateBuildingCosts.bind(this);
    this.updateBuildingCounts = this.updateBuildingCounts.bind(this);
    this.gameBackgroundInit = this.gameBackgroundInit.bind(this);
    this.gameItemDraw = this.gameItemDraw.bind(this);
    this.gameOverlayInit = this.gameOverlayInit.bind(this);
    this.gameRedrawGridXYPos = this.gameRedrawGridXYPos.bind(this);
    this.gameRedrawGridPos = this.gameRedrawGridPos.bind(this);
    this.getMousePos = this.getMousePos.bind(this);
    this.cursorPositionOnCanvas = this.cursorPositionOnCanvas.bind(this);
    this.cursorGridPositionOnCanvas = this.cursorGridPositionOnCanvas.bind(this);
    this.getGridPosition = this.getGridPosition.bind(this);
    this.farmModalClick = this.farmModalClick.bind(this);
  }
  
  componentDidMount() {
    this.gameTimer = window.setInterval(this.gameLoop, this.gameTimerInverval);
    this.gameLoop();

    window.setTimeout(this.gameBackgroundInit, 100);
    //this.gameBackgroundInit();
  }

  gameBackgroundInit(){
    this.ctx = document.getElementById("game").getContext("2d");
    this.groundTiles = document.getElementById("boardTilesImage");

    this.map = {
      cols: 32,
      rows: 20,
      tsize: 32,
      csize: 32,
      tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 18, 19, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6
      ],
      getTile(col, row) {
        return this.tiles[row * this.cols + col];
      },
    };

    for (let c = 0; c < this.map.cols; c++) {
      for (let r = 0; r < this.map.rows; r++) {
        const tile = this.map.getTile(c, r);
        if (tile !== 11) {
          // 0 => empty tile

          var sourceX = tile;
          var sourceY = 0;
          if(tile >= 7){
            sourceY = Math.floor(tile / 7);
            sourceX = tile - (7 * sourceY);
          }
          this.ctx.drawImage(
            this.groundTiles, // image
            sourceX * this.map.tsize, // source x
            sourceY * this.map.tsize, // source y
            this.map.tsize, // source width
            this.map.tsize, // source height
            c * this.map.csize, // target x
            r * this.map.csize, // target y
            this.map.csize, // target width
            this.map.csize // target height
          );
        }
      }
    }

    this.gameItemDraw();
    this.gameOverlayInit()
    this.gameOverlayDraw();
    this.gameLoaded = true;
  }

  gameItemDraw(){
    this.itemTiles = document.getElementById("itemTilesImage");
    this.itemMap = {
      cols: 32,
      rows: 20,
      tsize: 32,
      csize: 32,
      tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 0, 0, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ],
      getTile(col, row) {
        return this.tiles[row * this.cols + col];
      },
    };

    for (let c = 0; c < this.itemMap.cols; c++) {
      for (let r = 0; r < this.itemMap.rows; r++) {
        var tile = this.itemMap.getTile(c, r);
        if (tile !== 0) {
          // 0 => empty tile

          var sourceX = tile-1;
          var sourceY = 0;
          var image = this.itemTiles;
          if(tile > 7){
            sourceY = Math.floor(tile / 7);
            sourceX = tile - (7 * sourceY);
          }
          this.ctx.drawImage(
            image, // image
            sourceX * this.itemMap.tsize, // source x
            sourceY * this.itemMap.tsize, // source y
            this.itemMap.tsize, // source width
            this.itemMap.tsize, // source height
            c * this.itemMap.csize, // target x
            r * this.itemMap.csize, // target y
            this.itemMap.csize, // target width
            this.itemMap.csize // target height
          );
        }
      }
    }
  }

  gameOverlayInit(){
    this.overlayTiles = document.getElementById("overlayTilesImage");
    this.overlayMap = {
      cols: 32,
      rows: 20,
      tsize: 32,
      csize: 32,
      tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ],
      getTile(col, row) {
        return this.tiles[row * this.cols + col];
      },
      setTile(col, row, val) {
        this.tiles[row * this.cols + col] = val;
      },
    };
  }

  gameOverlayDraw(){
    for (let c = 0; c < this.overlayMap.cols; c++) {
      for (let r = 0; r < this.overlayMap.rows; r++) {
        const tile = this.overlayMap.getTile(c, r);
        if (tile !== 0) {
          // 0 => empty tile

          var sourceX = tile-1;
          var sourceY = 0;
          if(tile >= 9){
            sourceY = Math.floor(tile / 9);
            sourceX = tile - (9 * sourceY);
          }
          this.ctx.drawImage(
            this.overlayTiles, // image
            sourceX * this.overlayMap.tsize, // source x
            sourceY * this.overlayMap.tsize, // source y
            this.overlayMap.tsize, // source width
            this.overlayMap.tsize, // source height
            c * this.overlayMap.csize, // target x
            r * this.overlayMap.csize, // target y
            this.overlayMap.csize, // target width
            this.overlayMap.csize // target height
          );
        }
      }
    }
  }

  gameRedrawGridXYPos(gX, gY){
    const tile = this.map.getTile(gX, gY);
    var sourceX = tile;
    var sourceY = 0;
    if(tile >= 7){
      sourceY = Math.floor(tile / 7);
      sourceX = tile - (7 * sourceY);
    }

    this.ctx.drawImage(
      this.groundTiles, // image
      sourceX * this.map.tsize, // source x
      sourceY * this.map.tsize, // source y
      this.map.tsize, // source width
      this.map.tsize, // source height
      gX * this.map.csize, // target x
      gY * this.map.csize, // target y
      this.map.csize, // target width
      this.map.csize // target height
    );
  }

  gameRedrawGridPos(pos){
    var tile = this.map.tiles[pos];
    var sourceX = tile;
    var sourceY = 0;
    if(tile >= 7){
      sourceY = Math.floor(tile / 7);
      sourceX = tile - (7 * sourceY);
    }

    var gridYPos = Math.floor(pos / this.map.cols);
    var gridXPos = pos - (gridYPos * this.map.cols);
    if(gridXPos < 0){
      gridXPos = 0;
    }
    if(gridYPos < 0){
      gridYPos = 0;
    }

    this.ctx.drawImage(
      this.groundTiles, // image
      sourceX * this.map.tsize, // source x
      sourceY * this.map.tsize, // source y
      this.map.tsize, // source width
      this.map.tsize, // source height
      gridXPos * this.map.csize, // target x
      gridYPos * this.map.csize, // target y
      this.map.csize, // target width
      this.map.csize // target height
    );

    tile = this.itemMap.tiles[pos];
    sourceX = tile-1;
    sourceY = 0;
    this.ctx.drawImage(
      this.itemTiles, // image
      sourceX * this.itemMap.tsize, // source x
      sourceY * this.itemMap.tsize, // source y
      this.itemMap.tsize, // source width
      this.itemMap.tsize, // source height
      gridXPos * this.itemMap.csize, // target x
      gridYPos * this.itemMap.csize, // target y
      this.itemMap.csize, // target width
      this.itemMap.csize // target height
    );
  }

  getMousePos(_event){
    var canvas = document.getElementById("game"),
    bx = canvas.getBoundingClientRect(),
    pos = {
        x: (_event.changedTouches ? _event.changedTouches[0].clientX : _event.clientX) - bx.left,
        y: (_event.changedTouches ? _event.changedTouches[0].clientY : _event.clientY) - bx.top,
        bx: bx
    };
    // ajust for native canvas matrix size
    pos.x = Math.floor((pos.x / canvas.scrollWidth) * canvas.width);
    pos.y = Math.floor((pos.y / canvas.scrollHeight) * canvas.height);
    // prevent default
    _event.preventDefault();
    return pos;
  }

  cursorPositionOnCanvas(_event){
    var pos = this.getMousePos(_event);
    //console.log(pos.x + "," + pos.y);
    document.getElementById("mouseX").innerHTML = pos.x;
    document.getElementById("mouseY").innerHTML = pos.y;
    /*var cell = state.grid.getCellFromPoint(pos.x, pos.y);
    if (cell.enemy) {
        state.grid.kills += 1;
        cell.enemy = false;
    }*/
  }

  getGridPosition(_event){
    var pos = this.getMousePos(_event);
    // -1 because it always seems to be 1 pixel early changing to the next grid
    var gridXPos = Math.floor((pos.x - 1) / this.map.csize);
    var gridYPos = Math.floor((pos.y - 1) / this.map.csize);
    if(gridXPos < 0){
      gridXPos = 0;
    }
    if(gridYPos < 0){
      gridYPos = 0;
    }
    document.getElementById("gridX").innerHTML = gridXPos;
    document.getElementById("gridY").innerHTML = gridYPos;

    var grid = {
      x: gridXPos,
      y: gridYPos
    };
    return grid;
  }

  cursorGridPositionOnCanvas(_event){
    var grid = this.getGridPosition(_event);

    //Only need to update if grid position changed
    if(this.overlayMap.getTile(grid.x, grid.y) === this.MOUSE_GRID_COLOUR){
      return;
    }

    var totalCells = this.overlayMap.cols * this.overlayMap.rows;
    for(var i = 0; i < totalCells; i++){

      if(this.overlayMap.tiles[i] === this.MOUSE_GRID_COLOUR){
        this.overlayMap.tiles[i] = 0;
        this.gameRedrawGridPos(i);
      }
    }

    //this.overlayMap.tiles[gridXPos + (gridYPos * this.overlayMap.cols)] = this.MOUSE_GRID_COLOUR;
    this.overlayMap.setTile(grid.x, grid.y, this.MOUSE_GRID_COLOUR)

    this.gameOverlayDraw();
  }

  farmModalClick(_event){
    var grid = this.getGridPosition(_event);
    if((grid.x === 25 || grid.x === 26 || grid.x === 27) && grid.y === 14){
      this.props.openFarmModal();
    }
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
    //document.getElementById("coinBalanceDisplay").innerText = this.totalBalance.toString();

    
    document.getElementById("coinBalance").innerText = this.totalBalance.toString();
    document.getElementById("coinTotal").innerText = this.total.toString();
    document.getElementById("coinsManual").innerText = this.totalClicked.toString();
    //this.updateBuildingCosts();
    this.updateBuildingCounts();
  }

  /*updateBuildingCosts(){
    for(var i = 0; i < this.totalBuildings; i++){
      document.getElementById("building"+i.toString()+"Cost").innerText = this.buildingCosts[i].toString();
    }
  }*/

  updateBuildingCounts(){
    for(var i = 0; i < this.totalBuildings; i++){
      document.getElementById("building"+i.toString()+"Purchased").innerText = this.buildingCounts[i].toString();
    }
  }

  /*buildingPurchase(_id){
    if(this.buildingCosts[_id] > this.totalBalance){
      return;
    }

    this.totalBalance -= this.buildingCosts[_id];
    this.buildingCosts[_id] += 5;
    this.buildingCounts[_id]++;

    
    document.getElementById("coinBalanceDisplay").innerText = this.totalBalance.toString();
    document.getElementById("building"+_id.toString()+"Cost").innerText = this.buildingCosts[_id].toString();
    //document.getElementById("building"+_id.toString()+"Purchased").innerText = this.buildingCounts[_id].toString();
  }*/

  render() {
    return (
      <div id="content" className="row">
        <div id="statsColumn" className="column leftGameColumn2">
          <p>Coins mined: <span id="coinTotal"></span><br/>
            Coins in wallet: <span id="coinBalance"></span><br/>
            Coins manually mined: <span id="coinsManual"></span><br/>
            Pickaxes purchased: <span id="building0Purchased"></span><br/>
            Miners purchased: <span id="building1Purchased"></span><br/>
            Cursor location: <span id="mouseX">0</span>,<span id="mouseY">0</span><br/>
            Grid location: <span id="gridX">0</span>,<span id="gridY">0</span></p>
        </div>
        <div id="clickColumn" className="column centreGameColumn2">
          <canvas id="game" width="1024" height="640" className="gameCanvas" onMouseMove={(event) => {
            if(this.gameLoaded){
              this.cursorPositionOnCanvas(event);
              this.cursorGridPositionOnCanvas(event);
            }
          }} onMouseOut={(event) => {
            if(this.gameLoaded){
              // Remove the darkened box for mouse-overed tiles if mouse is not on canvas
              var totalCells = this.map.cols * this.map.rows;
              for(var i = 0; i < totalCells; i++){

                if(this.overlayMap.tiles[i] === this.MOUSE_GRID_COLOUR){
                  this.overlayMap.tiles[i] = 0;
                  this.gameRedrawGridPos(i);
                }
              }
            }
          }} onMouseUp={(event) => {
            this.farmModalClick(event);
          }}></canvas>
          
        </div>
        <img id="boardTilesImage" src={groundTileMap} alt="background tiles" className="imageLibrary"/>
        <img id="itemTilesImage" src={itemTileMap} alt="item tiles" className="imageLibrary"/>
        <img id="overlayTilesImage" src={overlayTileMap} alt="overlay tiles" className="imageLibrary"/>
      </div>
    );
  }
}

/*
<div className="clickerDiv">
            <img id="pickaxe" src={pickaxe} className="pickaxeImage imageRotate" alt="clicky" onClick={(event) => {
              event.preventDefault();
              this.miningClick();
            }}/><img id="gpu" src={gpu} className="gpuImage" alt="smashy" />
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


          <p className="displayHeader"><span id="coinBalanceDisplay"></span><br/>coins</p>
*/

export default Game;