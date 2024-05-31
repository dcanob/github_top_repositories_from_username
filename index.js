const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const GITHUB_API_URL = 'https://api.github.com';
const USERNAME = 'google';

async function fetchAllRepos(username) {
    let repos = [];
    let page = 1;
    let per_page = 100;

    while (true) {
        console.log(`Consultando pagina ${page} ...`);

        const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos`, {
            params: {
                per_page,
                page
            }
        });

        repos = repos.concat(response.data);

        if (response.data.length < per_page) {
            break; // Si la última página tiene menos repositorios de los solicitados, hemos terminado
        }
        page++;
    }

    return repos;
}

app.get('/top-repos', async (req, res) => {
    try {
        const repos = await fetchAllRepos(USERNAME);

        // Ordenar los repositorios por el número de estrellas
        console.log(`Ordenando ...`);
        repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

        // Seleccionar los 10 primeros repositorios
        console.log(`Selecionando top 10 ...`);
        const topRepos = repos.slice(0, 10).map(repo => ({
            name: repo.name,
            stars: repo.stargazers_count,
            url: repo.html_url
        }));

        console.log(`Resultados listos.`);
        res.json(topRepos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los repositorios' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
