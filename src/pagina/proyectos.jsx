import React from "react";
import { Link } from 'react-router-dom';
import { Col, Container, Image, Row } from "react-bootstrap";
import DictionaryProjects from "../components/DictionaryProjects";

function Proyecto_plantilla({ proyectos }) {
    return (
        <Container className="pt-4 mb-5">
            {proyectos.map((proyecto, index) => (
                <Link to={`${proyecto.url}`} style={{textDecoration: 'none'}} >
                    <Row className="pt-4 justify-content-center shadow rounded-4 mb-2 py-3" key={index}>
                        <Col bsPrefix="col-auto my-auto" style={{ width: "300px" }}>
                            <Row className="g-0">
                                <Image src={proyecto.image} alt="" style={{ objectFit: "cover" }} />
                            </Row>
                        </Col>
                        <Col bsPrefix="col-auto col-md-5 my-auto">
                            <div className="h3">{proyecto.nombre}</div>
                            <p className="text-dark ">{proyecto.description}</p>
                        </Col>
                    </Row>
                </Link>
            ))}
        </Container >
    );
}

function Proyectos() {
    return (

        <Container>
            <Proyecto_plantilla proyectos={DictionaryProjects} />
        </Container>
    )
}

export default Proyectos