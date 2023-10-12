import React from "react";
import { useState } from 'react'
import {Link} from 'react-router-dom'

function Header() {
    return (
      <div className="container-fluid-lg border">
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
          <div className='container-fluid'>
            <Link to="/" className="navbar-brand">SelraK</Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarColor01"
              aria-controls="navbarColor01"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
    
            <div className="collapse navbar-collapse flex-row-reverse" id="navbarColor01">
              <ul className='navbar-nav ml-auto'>
                <li className='nav-item'>
                  <Link to="/photography" className='nav-link'>Photography</Link>
                </li>
                <li className='nav-item'>
                  <Link to="/blender" className='nav-link'>Blender</Link>
                </li>

                
                <li className='nav-item'>
                  <Link to="https://github.com/carlesmatoses" className='nav-link'>GitHub</Link>
                </li>

              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }

export default Header