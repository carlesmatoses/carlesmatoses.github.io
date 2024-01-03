import React from "react";
import TabComponent from "../components/TabComponent.jsx";
import SocialMedia from "../components/SocialMedia.jsx";


function Index() {

  return (

    <div className="container pt-3">

      <div className="row justify-content-center">
        <div className="row row-cols-1 row-cols-sm-2" style={{ maxWidth: "700px" }}>

          <div className="col d-flex align-items-center pb-3">
            <div className="row row-cols-1">
              <div className="col"><div className="h1 text-center">Hello!</div></div>
              <div className="col"><div className="h3 fw-light text-center">My Name's Carles</div></div>
              <div className="col"><div className="fw-light text-center">And sometimes SelraK!</div></div>
            </div>
          </div>

          <div className="col d-flex align-items-center pb-3">
            <div className="row row-cols-1 g-2">
              <div className="col"><div className="fw-light text-center">I studied Digital Technologies and Multimedia at the Polytechnic University of Valencia.</div></div>
              <div className="col"><div className="fw-light text-center">I like photography, Visual Effects, CGI, and developing multimedia apps.</div></div>
            </div>
          </div>

        </div>
      </div>
      <SocialMedia size={"30px"} />

      <hr />
      <div className="row pt-3">
        <TabComponent />
      </div>



    </div >
  )
}

export default Index