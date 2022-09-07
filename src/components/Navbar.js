import React, { Component } from 'react';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar fixed-top flex-md-nowrap p-0 shadow navbarBack">
        <span className="navbar-brand col-sm-3 col-md-2 mr-0" >
          &nbsp;
        </span>
        <span className="navbar-brand col-sm-3 col-md-2 mr-0 topCentre" >
          {this.props.title}
        </span>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">{this.props.account}</span></small>
          </li>
        </ul>
      </nav>
    );
  }
}
export default Navbar;