import React from "react";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
const username = "carlesmatoses"

// function obtenerRepositorios(username) {
//     const apiUrl = `https://api.github.com/users/${username}/repos`;

//     return fetch(apiUrl)
//       .then((response) => response.json())
//       .then((data) => {
//         const repositorios = data.map((repo) => ({
//           nombre: repo.name,
//           avatar: repo.owner.avatar_url, // Puedes ajustar la ruta a la imagen del repositorio si está disponible en la respuesta de la API de GitHub.
//           enlace: repo.html_url,
//           imagen: `https://opengraph.githubassets.com/0/${username}/${repo.name}`,
//         }));
//         return repositorios;
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   }




function Grid() {
  const [repos, setRepos] = useState([]); // Inicializa el estado con un arreglo vacío

  // Llama a la función para obtener los datos de los repositorios
  useEffect(() => {
    // Llama a la función para obtener los datos de los repositorios
    obtenerRepositorios(username)
      .then((data) => {
        setRepos(data); // Actualiza el estado con los datos
      });
  }, [username]);

  const obtenerRepositorios = async (username) => {
    try {
      const apiUrl = `https://api.github.com/users/${username}/repos`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      const repositorios = data.map((repo) => ({
        nombre: repo.name,
        avatar: repo.owner.avatar_url,
        enlace: repo.html_url,
        description: repo.description,
        imagen: `https://opengraph.githubassets.com/0/${username}/${repo.name}`,
      }));

      return repositorios;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 justify-content-center">

      {repos.map((elemento, elementoIndex) => (
        <div className="col col-8 col-6-sm m-2 " key={elementoIndex}>
          <div className="card h-100">

            <div className="card-body">
              <h5 className="card-title">{elemento.nombre}</h5>
              <p className="card-text">{`${elemento.description}`}</p>
            </div>
            {/* <div className="card-footer">
                            <a href={elemento.enlace} className="btn btn-primary">Go   </a>
                        </div> */}
            <a href={elemento.enlace}><img src={elemento.imagen} className="card-img-top" /></a>
          </div>

        </div>
      ))}
    </div>
  );
}

function GithubRepos() {
  return (
    <div className="container ">
      <Grid />
    </div>

  )
}

export default GithubRepos