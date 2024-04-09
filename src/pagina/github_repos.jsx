import React from "react";
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import obtenerNombresDeRepositorios from "../components/github_info";
const username = "carlesmatoses"


import DefaultGrid from "../components/default_grid";
import DefaultCard from "../components/default_card";

function GithubRepos() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {   // obtener los datos de los repositorios
    obtenerRepositorios(username)
      .then((data) => {
        setRepos(data);
      });
  }, [username]);

  const obtenerRepositorios = async (username) => {
    try {
      const apiUrl = `https://api.github.com/users/${username}/repos`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      const repositorios = data.map((repo) => ({
        name: repo.name,
        avatar: repo.owner.avatar_url,
        url: repo.html_url,
        description: repo.description,
        image: `https://opengraph.githubassets.com/0/${username}/${repo.name}`,
      }));
      return repositorios;

    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  return (
    <div className="container ">
      <DefaultGrid Element={DefaultCard} dictionary={repos} />
    </div>

  )
}

export default GithubRepos