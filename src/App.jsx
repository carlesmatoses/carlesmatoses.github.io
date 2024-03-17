
import React from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from "./components/Header.jsx";
import Index from './pagina/index.jsx';
import SocialMedia from './components/SocialMedia.jsx';
import Gallery from './pagina/Gallery.jsx';
import BlogDetailPage from './pagina/blogs.jsx';
import { HelmetProvider } from 'react-helmet-async';

// Styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'; // Importa el JavaScript de Bootstrap


function App() {
  return (
    <HelmetProvider>
      <Router>
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
          <Route path='blogs/:blogId' element={
            <>
              <Header />
              <BlogDetailPage />
            </>
          } 
          />

        </Routes>
      </Router>
    </HelmetProvider>
  );
}


const root = createRoot(document.getElementById('root'));
root.render(
  <App />
);

// export default App