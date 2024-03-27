import React from "react";
import { Row, Container, Col } from "react-bootstrap";
import TabComponent from "../components/TabComponent.jsx";
import SocialMedia from "../components/SocialMedia.jsx";
import { Helmet } from "react-helmet-async";

function Index() {

  return (
    <>
      <Helmet><title>Carles Matoses Gimenez</title></Helmet>

      <Container>

        <Container className="my-4" style={{maxWidth:"800px"}}>
          <Row className="g-1">
            <div className="h3 fw-normal ">About me</div>
            <div className="fw-light ">
              I have a <span className="fw-bolder">master degree in computer graphics</span> by the Polytechnic University of Catalonya
              and a <span className="fw-bolder">bachelor's degree in Digital Technologies and Multimedia</span> by the Polytechnic University of Valencia.
            </div>
          </Row>
          <Row className="mt-3">
            <div className="fw-light ">
              I like photography, Visual Effects, CGI, and developing multimedia apps.
            </div>
          </Row>
          <Row className="mt-3">
            <SocialMedia size={"40px"} />
          </Row>
          <hr />
        </Container>

        <Container className="my-3">
          <Row >
            <TabComponent />
          </Row>
        </Container>

      </Container >
    </>
  )
}

export default Index