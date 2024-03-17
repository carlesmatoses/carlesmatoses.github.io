import React from "react";
import { Link } from 'react-router-dom';
import { Col, Container, Image, Row } from "react-bootstrap";
import DictionaryProjects from "../components/DictionaryProjects";

function Proyecto_plantilla({ proyecto }) {
    return (
        <Link to={`${proyecto.url}`} style={{textDecoration: 'none'}} >
            <Row className="justify-content-center shadow border rounded-4 p-0 m-0 mb-2 pt-2 pb-3">
                <Col bsPrefix="col-auto my-auto" style={{ width: "300px" }}>
                    <Row className="g-0">
                        <Image className="rounded-3" src={proyecto.image} alt="" style={{ objectFit: "cover" }} />
                    </Row>
                </Col>
                <Col bsPrefix="col-auto col-md-7 mt-1 my-auto">
                    <p className="h4">{proyecto.nombre}</p>
                    <p className="text-secondary">{proyecto.description}</p>
                </Col>
            </Row>
        </Link>
    );
}

function Proyectos() {
    return (

        <Container className="p-0 m-0 mt-2 mb-5">
            {DictionaryProjects.map((proyecto, index) => (
                <Proyecto_plantilla key={index} proyecto={proyecto} />
            ))}
        </Container>
    )
}

export default Proyectos