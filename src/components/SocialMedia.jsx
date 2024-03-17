import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaGithub, FaYoutube, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

const socialMediaList = [
    { name: "GitHub", url: "https://github.com/carlesmatoses", icon: <FaGithub /> },
    { name: "YouTube", url: "https://www.youtube.com/@selrak14", icon: <FaYoutube /> },
    //   { name: "LinkedIn", url: "https://www.linkedin.com/in/yourprofile", icon: <FaLinkedin /> },
    { name: "Instagram", url: "https://www.instagram.com/selrak222/", icon: <FaInstagram /> },
    { name: "Email", url: "mailto:carlesmatosesg@gmail.com", icon: <FaEnvelope /> },
];

const SocialMedia = ({ size }) => {
    return (
        <Container>
            <Row className="justify-content-center">
                {socialMediaList.map((item, index) => (
                    <Col key={index} xs="auto" className="p-2">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" title={item.name}>
                            {React.cloneElement(item.icon, { size })}
                        </a>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default SocialMedia;