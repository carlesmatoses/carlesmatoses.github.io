import React from "react";
import { Row, Container } from "react-bootstrap";
import TabComponent from "../components/TabComponent.jsx";
import SocialMedia from "../components/SocialMedia.jsx";
import { Helmet } from "react-helmet-async";

function Index() {

  return (
    <>
    <Helmet><title>Carles Matoses Gimenez</title></Helmet>
    
    <Container>

      {/* <Row className="justify-content-center"> */}
        <Row className="justify-content-center row-cols-1 mx-3">

          <div className="col mb-3">
            <div className="row row-cols-1">
              {/* <div className="col"><div className="h1 text-center">Hello!</div></div> */}
              <div className="col"><div className="h3 fw-light text-center">My Name's</div></div>
              <div className="col"><div className="h3 fw-normal text-center">Carles Matoses Gimenez</div></div>
              <div className="col"><div className="fw-light text-center">And sometimes SelraK!</div></div>
            </div>
          </div>

          <div className="col mb-3">
            <div className="row row-cols-1 g-2">
              {/* <div className="col"><div className="fw-light text-center">I have a <b>master degree in computer graphics</b> by the Polytechnic University of Catalonya and a <b>bachelors degree in Digital Technologies and Multimedia</b> by the Polytechnic University of Valencia.</div></div> */}
              <div className="col"><div className="fw-light text-center">I have a <b><u>master degree in computer graphics</u></b> by the Polytechnic University of Catalonya and a</div></div>
              <div className="col"><div className="fw-light text-center"><b><u>bachelor's degree in Digital Technologies and Multimedia</u></b> by the Polytechnic University of Valencia</div></div>
              <div className="col"><div className="fw-light text-center">I like photography, Visual Effects, CGI, and developing multimedia apps.</div></div>
            </div>
          </div>

        </Row>
      {/* </Row> */}

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