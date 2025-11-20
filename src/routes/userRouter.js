import { Router } from 'express'
import { db } from '../db/db.js'

const userRouter = Router()

userRouter.get('/me/info'),
    async (req, res) => {
        const username = req.user.username
        const sql =
            'SELECT username, slug, bio, email, date_joined FROM users WHERE username = $1'
        const result = await db.query(sql, username)

        res.status(200).json(result.rows[0])
    }

userRouter.get('/me/movies'),
    async (req, res) => {
        const username = req.user.username
        const sql =
            'SELECT m.slug, m.title, m.description, m.date_added, m.img, u.username FROM movies AS m JOIN users AS u ON m.user_id = u.id WHERE u.username = $1'
        const result = await db.query(sql, username)

        res.status(200).json(result.rows)
    }

userRouter.get('/me/playlists'),
    async (req, res) => {
        const username = req.user.username
        const sql = `SELECT
        p.slug,
        p.title,
        p.summary,
        p.img,
        p.date_created,
        COALESCE(
            json_agg(m.slug) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS movies,
        u.username AS author
        FROM playlists p
        LEFT JOIN playlist_movies pm ON pm.playlist_id = p.id
        LEFT JOIN movies m ON m.id = pm.movie_id
        LEFT JOIN users u ON u.id = p.user_id
        WHERE u.username = $1
        GROUP BY p.id, u.username`
        const result = await db.query(sql, username)

        res.status(200).json(result.rows)
    }

export default userRouter
