import React from "react";
import { useState } from 'react';
import {Link} from 'react-router-dom';
import logo from "../../assets/logogris.png";

function Logo_plantilla({scaleX}){
  return(
  <img 
    src={logo} 
    alt="" 
    width="30"
    style={{ transform: `scaleX(${scaleX})` }}
   />
   );
}

function Header() {

    return (
      // <div className="container-fluid-lg">
        <nav className="navbar  navbar-expand-sm navbar-dark bg-dark">

          <div className='container'>

            <Link to="/" className="navbar-brand"><Logo_plantilla scaleX={1}/></Link>
            <Link to="/" className="navbar-brand">SelraK</Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
              <div className="navbar-nav  pe-5">
                  <Link to="/" className='nav-link'> Home</Link>
                  <Link to="/photography" className='nav-link'>Photography</Link>
                  <Link to="/blender" className='nav-link'>Blender</Link>
                  <Link to="https://github.com/carlesmatoses" className='nav-link'>GitHub</Link>
                </div>
            </div>
            {/* <Link to="/" className="navbar-brand"><Logo_plantilla scaleX={-1}/></Link> */}
          </div>
        </nav>
      // </div>
    );
  }

export default Header