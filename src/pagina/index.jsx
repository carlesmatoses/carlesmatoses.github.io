import React from "react";
import {Link} from 'react-router-dom';
import { useState } from 'react';
import obtenerNombresDeRepositorios from "../components/github_info.jsx";
const carlesmatoses = "carlesmatoses";

function Index(){

  const mostrarNombresDeRepositorios = obtenerNombresDeRepositorios(carlesmatoses);

  return(

  <div className="container" >

    <div className="row" >
      <h1 className=" h1 text-center">Hello!</h1>
      <h1 className="text-center h3">
         <p className="fw-light">My Name's Carles</p>
      </h1>
    </div>

    <div className="row justify-content-center">
      <div className="col-auto m-3">

        <p>
          And sometimes SelraK!
        </p>
        <p className="pt-1">
          I studied Digital Technologies and Multimedia at the Polytechnic University of Valencia,
        </p>
        <p>
          And I like photography, Visual Effects, CGI, and developing multimedia apps.
        </p>
        
      </div>
    </div>
    
  </div>

    )
}

export default Index