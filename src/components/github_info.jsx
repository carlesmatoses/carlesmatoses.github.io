function obtenerNombresDeRepositorios(username) {
    const apiUrl = `https://api.github.com/users/${username}/repos`;
  
    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const nombres = data.map((repo) => repo.name);
        return nombres;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  export default obtenerNombresDeRepositorios;
  