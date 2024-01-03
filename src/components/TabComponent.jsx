import React, { useState } from 'react';
import Proyectos from '../pagina/proyectos';
import GithubRepos from '../pagina/github_repos';

function TabComponent() {
  const [activeTab, setActiveTab] = useState('Projects'); // Inicialmente, 'Projects' está activa

  const handleTabClick = (tab) => {
    setActiveTab(tab); // Establece la pestaña clicada como activa
  };

  return (
    <div className="container " style={{ minHeight: "1000px" }}>
      <div className="nav nav-tabs">
        <a
          className={`nav-link ${activeTab === 'Projects' ? 'active' : ''}`}
          onClick={() => handleTabClick('Projects')}
          // href="#"
        >
          Projects
        </a>
        <a
          className={`nav-link ${activeTab === 'GitHub' ? 'active' : ''}`}
          onClick={() => handleTabClick('GitHub')}
          // href="#"
        >
          GitHub
        </a>
        <a
          className={`nav-link ${activeTab === 'Blender' ? 'active' : ''}`}
          onClick={() => handleTabClick('Blender')}
          // href="#"
        >
          Blender
        </a>
      </div>


      {/* Contenido de las pestañas */}
      {activeTab === 'Projects' && (
        <Proyectos />
      )}
      {activeTab === 'GitHub' && (
        <GithubRepos />
      )}
      {activeTab === 'Blender' && (
        <div>Contenido de la pestaña Blender</div>
      )}
    </div>
  );
}

export default TabComponent;
