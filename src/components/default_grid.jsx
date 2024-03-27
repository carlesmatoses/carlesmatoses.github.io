// default_grid.jsx 

import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./default_style.css"

function DefaultGrid({Element, dictionary}) {
    return (
        <Container className="p-0 m-0 mt-2 mb-5">
            <Row xs={1} sm={2} className="g-4 justify-content-center">
                {dictionary.map((el, idx) => (
                    <Col key={idx} style={{ width: "300px" }}>
                        <Element {...el}/>
                    </Col>
                ))}
            </Row>
        </Container>
    )
}

export default DefaultGrid