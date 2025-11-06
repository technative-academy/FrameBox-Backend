import { Router } from 'express'
import {
    getTestPlaylist,
    getTestPlaylists,
    updateTestPlaylist,
} from '../test-values/playlistTestValues.js'
import { db } from '../db/db.js'

const playlistRouter = Router()

playlistRouter.get('/', async (req, res) => {
    const result = await db.query(
        'SELECT p.slug, p.title, p.summary, p.date_created FROM playlists AS p'
    )
    res.status(200).json(result.rows)
})

playlistRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug
    const sql = `
    SELECT 
        p.slug,
        p.title,
        p.summary,
        p.date_created,
        COALESCE(
            json_agg(
                json_build_object(
                    'slug', m.slug,
                    'title', m.title,
                    'description', m.description,
                    'date_added', m.date_added,
                    'img', m.img
                )
            ) 
        ) AS movies
        FROM playlists p
        LEFT JOIN playlist_movies pm ON pm.playlist_id = p.id
        LEFT JOIN movies m ON m.id = pm.movie_id
        WHERE p.slug = $1
        GROUP BY p.id;
    `
    const result = await db.query(sql, [slug])
    result.rowCount == 0
        ? res.status(404).json({
              status: 404,
              message: `entry with the slug "${slug}" was not found.`,
          })
        : null

    res.status(200).json(result.rows)
})

playlistRouter.patch('/:slug', async (req, res) => {
    let isRemovingEntry = false
    const slug = req.params.slug
    const incomingPatch = req.body
    const resultPlaylistId = await db.query(
        `SELECT p.id FROM playlists AS p WHERE p.slug = $1`,
        [slug]
    )
    const playlistId = resultPlaylistId.rows[0].id
    let movieId = null

    const fields = []
    const values = []

    if (incomingPatch.title) {
        fields.push(`title = $${fields.length + 1}`)
        values.push(incomingPatch.title)
        fields.push(`slug = $${fields.length + 1}`)
        values.push(
            slugify(incomingPatch.title, {
                replacement: '-',
                remove: /[*+~.()'"!:@]/g,
                lower: true,
            })
        )

        // a risk of potentially same slugs arises here: to be solved later
    }
    if (incomingPatch.summary) {
        fields.push(`summary = $${fields.length + 1}`)
        values.push(incomingPatch.summary)
    }
    if (incomingPatch.movie) {
        const resultMovieId = await db.query(
            `SELECT m.id FROM movies AS m WHERE m.slug = $1`,
            [incomingPatch.movie]
        )
        movieId = resultMovieId.rows[0].id
        const resultMovie = await db.query(
            `SELECT * FROM playlist_movies AS pm WHERE pm.playlist_id = $1 AND pm.movie_id = $2`,
            [playlistId, movieId]
        )
        resultMovie.rowCount === 0
            ? (isRemovingEntry = false)
            : (isRemovingEntry = true)
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update.' })
    }

    //pushing initial slug to specify which entry to patch
    values.push(slug)

    const sqlPlaylistInfo = `
    UPDATE playlists 
    SET ${fields.join(', ')} 
    WHERE "slug" = $${values.length}
    `

    const resultPlaylistInfo = await db.query(sqlPlaylistInfo, values)

    if (isRemovingEntry) {
        const sqlRemoveMovie = `
        DELETE FROM playlist_movies
        WHERE playlist_id = $1 AND movie_id = $2
        `

        const resultRemoveMovie = await db.query(sqlRemoveMovie, [
            playlistId,
            movieId,
        ])
    } else {
        const sqlInsertMovie = `
        INSERT INTO playlist_movies
        VALUES ($1, $2) 
        `
        console.log(playlistId)
        const resultInsertMovie = await db.query(sqlInsertMovie, [
            playlistId,
            movieId,
        ])
    }

    res.status(201).json(`Entry "${slug}" has been succesfully updated.`)
})

playlistRouter.delete('/:slug', async (req, res) => {
    const slug = req.params.slug
    const result = await db.query('DELETE FROM playlists WHERE slug = $1', [
        slug,
    ])
    res.status(204).end()
})
playlistRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Playlist created' })
})

export default playlistRouter
