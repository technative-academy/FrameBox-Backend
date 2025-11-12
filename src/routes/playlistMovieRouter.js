import { Router } from 'express'
import { addRemoveTestMoviesFromPlaylist } from '../test-values/playlistTestValues.js'
import { db } from '../db/db.js'

const playlistMovieRouter = Router()

//Add movies to a playlist
playlistMovieRouter.post('/', async (req, res) => {
    const slug = req.params.slug
    const incomingPost = req.body
    const moviesSlugs = incomingPost.movies
    const sqlInsertMovie = `
        INSERT INTO playlist_movies
        VALUES ($1, $2) 
        `

    const resultPlaylistId = await db.query(
        `SELECT p.id FROM playlists AS p WHERE p.slug = $1;`,
        [slug]
    )
    console.log(resultPlaylistId)
    const playlistId = resultPlaylistId.rows[0].id

    for (let i = 0; i < moviesSlugs.length; i += 1) {
        const resultMovieId = await db.query(
            `SELECT m.id FROM movies AS m WHERE m.slug = $1`,
            moviesSlugs[i]
        )
        const movieId = resultMovieId.rows[0].id
        const resultInsertMovie = await db.query(sqlInsertMovie, [
            playlistId,
            movieId,
        ])
    }

    res.status(201).json(
        `The following movies: ${moviesSlugs} have been added to "${slug}" playlist.`
    )
})

export default playlistMovieRouter
