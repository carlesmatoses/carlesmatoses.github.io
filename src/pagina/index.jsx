import React from "react";
import { Row, Container } from "react-bootstrap";
import TabComponent from "../components/TabComponent.jsx";
import SocialMedia from "../components/SocialMedia.jsx";
import { Helmet } from "react-helmet-async";

function Index() {

  return (
    <>
    <Helmet><title>Carles Matoses</title></Helmet>
    
    <Container>

      <Row className="justify-content-center">
        <div className="row row-cols-1 row-cols-sm-2" style={{ maxWidth: "700px" }}>

          <div className="col d-flex align-items-center pb-3">
            <div className="row row-cols-1">
              <div className="col"><div className="h1 text-center">Hello!</div></div>
              <div className="col"><div className="h3 fw-light text-center">My Name's Carles Matoses Gimenez</div></div>
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
      </Row>

      <SocialMedia size={"40px"}/>

      <hr />
      <Row className="mt-3">
        <TabComponent />
      </Row>

    </Container >
    </>
  )
}

export default Index