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

playlistRouter.patch('/:slug', updateTestPlaylist)
playlistRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
playlistRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Playlist created' })
})

export default playlistRouter
