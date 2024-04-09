// default_card.jsx

import React from "react";
import { useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./default_style.css"

function DefaultCard({ url, image, name, description }) {
    const [imgError, setImgError] = useState(false);

    const handleImgError = () => {
        setImgError(true);
    };

    return (
        <Link to={`${url}`} style={{ textDecoration: 'none' }} >
            <Card className="overflow-hidden shadow-sm">
                <Card.Img
                    variant="top"
                    src={imgError ? '../../assets/img_not_found.png' : image}
                    onError={handleImgError}
                />
                <Card.Body>
                    <Card.Title>{name}</Card.Title>
                    <Card.Text>{description}</Card.Text>
                </Card.Body>
            </Card>
        </Link>
    );
}

export default DefaultCard