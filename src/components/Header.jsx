import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import logo from "../../assets/logogris.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb as solidLightbulb } from '@fortawesome/free-solid-svg-icons';
import SocialMedia from "./SocialMedia";

function LogoPlantilla({ scaleX }) {
  return (
    <img
      src={logo}
      alt=""
      width="30"
      style={{ transform: `scaleX(${scaleX})` }}
    />
  );
}

function Header() {

  useEffect(() => {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const htmlElement = document.querySelector("html");

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const currentTheme = htmlElement.getAttribute("data-bs-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        htmlElement.setAttribute("data-bs-theme", newTheme);
      });
    }
  }, []);

  return (
    <Navbar expand="sm" className='shadow-sm mb-4'>
      <Container>
        <Navbar.Brand as={Link} to="/">
          {/* <LogoPlantilla scaleX={1} /> */}
          Carles Matoses Gimenez
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarNavAltMarkup" />

        <Navbar.Collapse id="navbarNavAltMarkup">
          <Nav className="ms-auto pt-3-sm pe-5">
            <Nav.Link className="text-end">
              <button id="theme-toggle" className="" style={{ border: "none ", background: "transparent" }}>
                <FontAwesomeIcon icon={solidLightbulb} size="xl" />
              </button>
            </Nav.Link>

            <Nav.Link as={Link} to="/" className="text-end">Home</Nav.Link>
            {/* <Nav.Link as={Link} to="/photography" className="text-end">Photography</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;

