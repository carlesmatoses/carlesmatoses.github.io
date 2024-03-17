import React from "react";
import { Link } from 'react-router-dom';
import { Col, Container, Image, Row, Card } from "react-bootstrap";
import DictionaryProjects from "../components/DictionaryProjects";

function Proyecto_plantilla({ proyecto }) {
    return (
        <Link to={`${proyecto.url}`} style={{ textDecoration: 'none' }} >
            <Card style={{ maxHeight: "400px" }} className="overflow-hidden shadow-sm">
                <Card.Img variant="top" src={proyecto.image} />
                <Card.Body>
                    <Card.Title>{proyecto.nombre}</Card.Title>
                    <Card.Text>{proyecto.description}</Card.Text>
                </Card.Body>
            </Card>
        </Link>
    );
}

function Proyectos() {
    return (

        <Container className="p-0 m-0 mt-2 mb-5">
            <Row xs={1} md={2} className="g-4 justify-content-center">
                {DictionaryProjects.map((proyecto, idx) => (
                    <Col key={idx} style={{ maxWidth: "300px" }}>
                        <Proyecto_plantilla proyecto={proyecto} />
                    </Col>
                ))}
            </Row>
        </Container>
    )
}

export default Proyectos