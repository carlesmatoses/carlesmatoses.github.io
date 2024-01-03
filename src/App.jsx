
import React from 'react'
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom'
import Header from "./components/Header.jsx";
import Index from './pagina/index.jsx';
import SocialMedia from './components/SocialMedia.jsx';
import Gallery from './pagina/Gallery.jsx';

// Styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'; // Importa el JavaScript de Bootstrap


function App() {
  return (
    <div>
      <HashRouter basename='/'>
        <Routes>
          <Route index element={
            <>
              <Header />
              <Index />
              <SocialMedia size={"40px"} />
            </>
          }
          />
          <Route path='photography' element={
            <>
              <Header />
              {/* <Gallery /> */}
            </>
          }
          />
          <Route path='blender' element={
            <>
              <Header />
            </>
          }
          />


        </Routes>
      </HashRouter>
    </div>
  );
}


const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);

// export default App