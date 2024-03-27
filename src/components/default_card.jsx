// default_card.jsx

import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./default_style.css"

function DefaultCard({ url, image, nombre, description }) {
    return (
        <Link to={`${url}`} style={{ textDecoration: 'none' }} >
            <Card className="overflow-hidden shadow-sm">
                <Card.Img variant="top" src={image} className=""/>
                <Card.Body>
                    <Card.Title>{nombre}</Card.Title>
                    <Card.Text>{description}</Card.Text>
                </Card.Body>
            </Card>
        </Link>
    );
}

export default DefaultCard