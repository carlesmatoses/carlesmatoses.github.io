import React, { useState } from 'react';
import Proyectos from '../pagina/proyectos';
import GithubRepos from '../pagina/github_repos';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

function TabComponent() {
  const [activeTab, setActiveTab] = useState('Projects');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Container style={{ minHeight: "1000px", width: "1000px" }}>
      <Nav justify variant="tabs" activeKey={activeTab}>
        <Nav.Item>
          <Nav.Link eventKey="Projects" onClick={() => handleTabClick('Projects')}>
            Projects
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="GitHub" onClick={() => handleTabClick('GitHub')}>
            GitHub
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="Blender" onClick={() => handleTabClick('Blender')}>
            Blender
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Content of the tabs */}
      {activeTab === 'Projects' && <Proyectos />}
      {activeTab === 'GitHub' && <GithubRepos />}
      {activeTab === 'Blender' && <div>Content of Blender tab</div>}
    </Container>
  );
}

export default TabComponent;