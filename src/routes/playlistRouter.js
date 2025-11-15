import { Router } from 'express'
import { db } from '../db/db.js'
import slugify from 'slugify'
import authenticateToken from '../middleware/auth.js'
import {
    validateMovieArray,
    validatePlaylistExists,
    validatePlaylistReq,
    validateMoviesExistArray,
    checkOwner,
} from '../middleware/validate.js'
import { slugIdentifier } from '../middleware/slugIdentifier.js'
import { duplicateCheckPlaylist } from '../middleware/duplicateCheck.js'
import NotFoundError from '../errors/NotFoundError.js'

const playlistRouter = Router()

const sqlGetPlaylist = `
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
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
    ) AS movies,
    u.username
    FROM playlists p
    LEFT JOIN playlist_movies pm ON pm.playlist_id = p.id
    LEFT JOIN movies m ON m.id = pm.movie_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.slug = $1
    GROUP BY p.id, u.username;

    `
//playlistRouter.use('/:slug/movies', playlistMovieRouter)

playlistRouter.get('/', async (req, res) => {
    const result = await db.query(
        `SELECT
        p.slug,
        p.title,
        p.summary,
        p.date_created,
        COALESCE(
            json_agg(m.slug) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS movies,
        u.username
        FROM playlists p
        LEFT JOIN playlist_movies pm ON pm.playlist_id = p.id
        LEFT JOIN movies m ON m.id = pm.movie_id
        LEFT JOIN users u ON u.id = p.user_id
        GROUP BY p.id, u.username;`
    )

    if (result.rowCount == 0) {
        throw new NotFoundError('No playlists found.')
    }

    res.status(200).json(result.rows)
})

playlistRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug

    const result = await db.query(sqlGetPlaylist, [slug])

    if (result.rowCount == 0) {
        throw new NotFoundError(`Playlist "${slug}" not found.`)
    }

    res.status(200).json(result.rows[0])
})

// Update the playlist's info
playlistRouter.patch(
    '/:slug',
    //authenticateToken,
    //checkOwner,
    validatePlaylistExists,
    validatePlaylistReq,
    slugIdentifier,
    duplicateCheckPlaylist,
    async (req, res) => {
        const slug = req.params.slug
        const incomingPatch = req.body

        const fields = []
        const values = []

        if (incomingPatch.title) {
            fields.push(`title = $${fields.length + 1}`)
            values.push(incomingPatch.title)
            fields.push(`slug = $${fields.length + 1}`)
            values.push(incomingPatch.slug)
        }
        if (incomingPatch.summary) {
            fields.push(`summary = $${fields.length + 1}`)
            values.push(incomingPatch.summary)
        }

        //pushing initial slug to specify which entry to patch
        values.push(slug)

        const sql = `
    UPDATE playlists 
    SET ${fields.join(', ')} 
    WHERE "slug" = $${values.length}
    RETURNING slug, title, summary, date_created
    `

        const result = await db.query(sql, values)

        res.status(200).json(result.rows[0])
    }
)

//Add movies to a playlist
playlistRouter.post(
    '/:slug/movies',
    //authenticateToken,
    //checkOwner,
    validatePlaylistExists,
    validateMovieArray,
    validateMoviesExistArray,
    async (req, res) => {
        const slug = req.params.slug
        const incomingPost = req.body
        const moviesSlugs = incomingPost.movies
        const sqlInsertMovie = `
        INSERT INTO playlist_movies
        VALUES ($1, $2) 
        `

        const resultPlaylistId = await db.query(
            `SELECT p.id FROM playlists AS p WHERE p.slug = $1`,
            [slug]
        )
        const playlistId = resultPlaylistId.rows[0].id

        //can rid the additional queries
        for (let i = 0; i < moviesSlugs.length; i += 1) {
            const resultMovieId = await db.query(
                `SELECT m.id FROM movies AS m WHERE m.slug = $1`,
                [moviesSlugs[i]]
            )
            const movieId = resultMovieId.rows[0].id
            const resultInsertMovie = await db.query(sqlInsertMovie, [
                playlistId,
                movieId,
            ])
        }

        const resultResponse = await db.query(sqlGetPlaylist, [slug])
        res.status(200).json(resultResponse.rows)
    }
)

playlistRouter.delete(
    '/:slug/movies',
    //authenticateToken,
    //checkOwner,
    validatePlaylistExists,
    validateMovieArray,
    validateMoviesExistArray,
    async (req, res) => {
        const slug = req.params.slug
        const incomingPost = req.body
        const moviesSlugs = incomingPost.movies
        const sqlRemoveMovie = `
        DELETE FROM playlist_movies
        WHERE playlist_id = $1 AND movie_id = $2
        `

        const resultPlaylistId = await db.query(
            `SELECT p.id FROM playlists AS p WHERE p.slug = $1`,
            [slug]
        )
        const playlistId = resultPlaylistId.rows[0].id

        for (let i = 0; i < moviesSlugs.length; i += 1) {
            const resultMovieId = await db.query(
                `SELECT m.id FROM movies AS m WHERE m.slug = $1`,
                [moviesSlugs[i]]
            )
            const movieId = resultMovieId.rows[0].id
            const resultRemoveMovie = await db.query(sqlRemoveMovie, [
                playlistId,
                movieId,
            ])
        }

        const resultResponse = await db.query(sqlGetPlaylist, [slug])
        res.status(200).json(resultResponse.rows)
    }
)

playlistRouter.delete(
    '/:slug',
    //authenticateToken,
    //checkOwner,
    validatePlaylistExists,
    async (req, res) => {
        const slug = req.params.slug
        const result = await db.query('DELETE FROM playlists WHERE slug = $1', [
            slug,
        ])
        res.status(204).end()
    }
)
playlistRouter.post(
    '/',
    //authenticateToken,
    validatePlaylistReq,
    slugIdentifier,
    duplicateCheckPlaylist,
    async (req, res) => {
        const sql = `INSERT INTO playlists (slug, title, summary, date_created)
        VALUES ($1, $2, $3, NOW())
        RETURNING slug, title, summary, date_created;
        `

        const result = await db.query(sql, [
            req.body.slug,
            req.body.title,
            req.body.summary || null,
        ])

        res.status(201).json(result.rows[0])
    }
)

export default playlistRouter
