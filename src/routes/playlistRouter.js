import { Router } from 'express'
import { db } from '../db/db.js'
import slugify from 'slugify'
import authenticateToken from '../middleware/auth.js'

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

playlistRouter.get('/', authenticateToken, async (req, res) => {
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
    res.status(200).json(result.rows)
})

playlistRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug

    const result = await db.query(sqlGetPlaylist, [slug])
    result.rowCount == 0
        ? res.status(404).json({
              status: 404,
              message: `entry with the slug "${slug}" was not found.`,
          })
        : null

    res.status(200).json(result.rows[0])
})

// Update the playlist's info
playlistRouter.patch(
    '/:slug',
    //authenticateToken,
    async (req, res) => {
        const slug = req.params.slug
        const incomingPatch = req.body

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

        const sql = `
    UPDATE playlists 
    SET ${fields.join(', ')} 
    WHERE "slug" = $${values.length}
    `

        const result = await db.query(sql, values)

        res.status(201).json(`Entry "${slug}" has been succesfully updated.`)
    }
)

//Add movies to a playlist
playlistRouter.post(
    '/:slug/movies',
    //authenticateToken,
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
        console.log(resultResponse)
        res.status(201).json(resultResponse.rows)
    }
)

playlistRouter.delete(
    '/:slug/movies',
    //authenticateToken,
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

        res.status(201).json(
            `The following movies: ${moviesSlugs} have been deleted from "${slug}" playlist.`
        )
    }
)

playlistRouter.delete(
    '/:slug',
    //authenticateToken,
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
    async (req, res) => {
        const incomingPost = req.body
        const userId = 'a6705e10-8d8c-48f9-ae3e-31b1bfacb4cc'

        //hardcoded for now

        if (!incomingPost.title) {
            return res
                .status(400)
                .json({ message: 'Title required to create.' })
        }

        const slug = slugify(incomingPost.title, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,
        })

        const sqlCreatePLaylist = `
            INSERT INTO playlists (slug, title, summary, date_created, user_id)
            VALUES ($1, $2, $3, NOW(), $4);
        `

        const resultCreatePlaylist = await db.query(sqlCreatePLaylist, [
            slug,
            incomingPost.title,
            incomingPost.summary || null,
            userId,
        ])

        const resultPlaylistId = await db.query(
            `SELECT p.id FROM playlists AS p WHERE p.slug = $1`,
            [slug]
        )
        const playlistId = resultPlaylistId.rows[0].id

        if (incomingPost.movies && incomingPost.movies.length > 0) {
            // Get movie IDs from slugs
            const movieSlugs = incomingPost.movies
            const placeholderSlugs = movieSlugs
                .map((_, i) => `$${i + 1}`)
                .join(', ')
            const sqlGetMoviesIds = `SELECT id FROM movies WHERE slug IN (${placeholderSlugs});`

            // This is very smart. It turns out that SQL can check a list of items for match
            // automatically using IN (Like Python does!!!!)

            const resultGetMoviesIds = await db.query(
                sqlGetMoviesIds,
                movieSlugs
            )
            const movieIds = resultGetMoviesIds.rows.map((row) => row.id)

            // Prepare bulk insert query
            const insertValues = []
            const params = []
            let paramIndex = 1

            for (const movieId of movieIds) {
                insertValues.push(`($${paramIndex++}, $${paramIndex++})`)
                params.push(playlistId, movieId)
            }

            const sqlFillPlaylist = `
                INSERT INTO playlist_movies (playlist_id, movie_id)
                VALUES ${insertValues.join(', ')}
            `
            await db.query(sqlFillPlaylist, params)
        }

        res.status(201).json({
            message: `Playlist "${incomingPost.title}" has been successfully created.`,
        })
    }
)

export default playlistRouter
