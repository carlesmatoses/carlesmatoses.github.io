import React from "react";
import { Link } from 'react-router-dom';
import { Col, Container, Image, Row } from "react-bootstrap";
import DictionaryProjects from "../components/DictionaryProjects";

function Proyecto_plantilla({ proyectos }) {
    return (
        <Container className="pt-4">
            {proyectos.map((proyecto, index) => (
                <Row className="pt-4 justify-content-center " key={index}>
                    <Col bsPrefix="col-auto my-auto" style={{ width: "300px" }}>
                        <Link to={`${proyecto.url}`}>
                            <Row className="g-0">
                                <Image src={proyecto.image} alt="" style={{ objectFit: "cover" }} />
                            </Row>
                        </Link>
                    </Col>
                    <Col bsPrefix="col-auto col-md-5 my-auto">
                        <div className="h3">{proyecto.nombre}</div>
                        <div>{proyecto.description}</div>
                    </Col>
                </Row>

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