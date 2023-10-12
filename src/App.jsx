
import React from 'react'
import { createRoot } from 'react-dom/client';
import {BrowserRouter, HashRouter, Routes, Route, Link} from 'react-router-dom'
import Header  from "./components/Header.jsx";
import Index from './pagina/index.jsx';

// Styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'; // Importa el JavaScript de Bootstrap


function App() {
  return (
    <>
      <HashRouter basename='/'>
        <Routes>
          <Route index element={
            <>
              <Header />
              <Index />
            </>
          }/>
          <Route path='photography' element={
            <>
              <Header />
            </>
          }/>
          <Route path='blender' element={
            <>
              <Header />
            </>
          }/>
        </Routes>
      </HashRouter>
    </>
  );
}


const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);

// export default App