import React from "react"
import {Link} from 'react-router-dom'
import { useState } from 'react'

function Index(){
    return(

  <div className="container" >

    <div className="row" >
      <h1 className=" h1 text-center">Hello!</h1>
      <h1 className="text-center h3">
         <p className="fw-light">My Name's Carles</p>
      </h1>
    </div>

    <div className="row p-3 fw-normal">
      <p>
        And sometimes SelraK!
      </p>
      <p className="pt-1">
        I studied Digital Technologies and Multimedia at the Polytechnic University of Valencia,
      </p>
      <p>
        And I like photography, Visual Effects, CGI, and deploying multimedia apps.
      </p>
    </div>
    
  </div>

    )
}

export default Index