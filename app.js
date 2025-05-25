import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

const API_URL = "https://api.jikan.moe/v4/";

let cacheRecommendation = null;
let cacheTopAnime = null;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("Public"));


app.get('/', (req, res) => {
    res.render('home');
})

app.get('/anime/recommendations', async (req, res) => {
    try {

        if (cacheRecommendation !== null) {
            return res.render('anime', { recommendations: cacheRecommendation, type: "top" });
        }

        const response = await axios.get(`${API_URL}/recommendations/anime/`);

        const recommendationsRaw = response.data.data;

        const limitedRecommendation = recommendationsRaw.slice(0, 11);

        let formattedRecommendations =
            limitedRecommendation
                .map(recommendationsOnpair =>
                    recommendationsOnpair.entry.map(anime => ({
                        mal_id: anime.mal_id,
                        title: anime.title,
                        images: anime.images.jpg.image_url,
                    }))
                )
                .flat();

        res.render('anime', { recommendations: formattedRecommendations, type: "recommendation" });
    } catch (error) {
        console.log(`Error message : ${error}`);
        res.send("Error");
    }

})

app.get('/anime/top', async (req, res) => {
    try {

        if (cacheTopAnime !== null) {
            return res.render('anime', { recommendations: cacheTopAnime, type: "top" });
        }

        const response = await axios.get(`${API_URL}top/anime?limit=21`);

        const topAnimeRaw = response.data.data;

        const formattedAnime = topAnimeRaw.map(anime => (
            {
                mal_id: anime.mal_id,
                title: anime.title,
                images: anime.images.jpg.image_url,
                episode: anime.episodes,
                year: anime.year,
                score: anime.score,
            }
        ))
        cacheTopAnime = formattedAnime;
        res.render('anime', { recommendations: formattedAnime, type: "top" });
    } catch (error) {
        res.send(`Error Message: ${error}`)
    }
})

app.get('/anime/search', async (req, res) => {
    try {
        const query = req.query.q;

        const response = await axios.get(`${API_URL}anime?q=${query}&limit=10`);

        const searchRaw = response.data.data;

        const formattedSearch = searchRaw.map(anime => (
            {
                mal_id: anime.mal_id,
                title: anime.title,
                images: anime.images.jpg.image_url,
                episode: anime.episodes,
                year: anime.year,
                score: anime.score
            }
        ))

        res.render('anime', { recommendations: formattedSearch, type: "Search" });
    } catch (error) {
        res.send(`Error Message: ${error}`);
    }

})

app.get('/anime/details/:id', async (req, res) => {
    try {
        let Animeid = parseInt(req.params.id);

        const response = await axios.get(`${API_URL}anime/${Animeid}`);

        const animeRaw = response.data.data;

        const formattedAnime =
        {
            title: animeRaw.title,
            images: animeRaw.images.jpg.large_image_url,
            synopsis: animeRaw.synopsis,
            episode: animeRaw.episodes,
            status: animeRaw.status,
            score: animeRaw.score,
            year: animeRaw.year,
            producer: animeRaw.producers[0].name,
            trailer: animeRaw.trailer.url,
            genres: animeRaw.genres[0].name
        }
        res.render('details', { details: formattedAnime });
    } catch (error) {
        res.send(`Error Message: ${error}`)
    }
})

app.use((req,res,next) => {
    res.status(404).render('404')
    next()
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})