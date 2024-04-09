function obtenerNombresDeRepositorios(username) {
    const apiUrl = `https://api.github.com/users/${username}/repos`;
  
    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const name = data.map((repo) => repo.name);
        return name;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  export default obtenerNombresDeRepositorios;
  