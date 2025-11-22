import { Router } from 'express'
import { db } from '../db/db.js'
import NotFoundError from '../errors/NotFoundError.js'
import {
    checkOwnerMovie,
    validateMovieExists,
    validateMovieReq,
} from '../middleware/validate.js'
import { slugIdentifier } from '../middleware/slugIdentifier.js'
import { duplicateCheckMovie } from '../middleware/duplicateCheck.js'
import authenticateToken from '../middleware/auth.js'
import { defaultImage } from '../middleware/image.js'

const movieRouter = Router()

//get all movies
movieRouter.get('/', async (req, res) => {
    const result = await db.query(
        'SELECT m.slug, m.title, m.description, m.date_added, m.img, u.username AS author FROM movies AS m JOIN users AS u ON m.user_id = u.id'
    )

    if (result.rowCount == 0) {
        throw new NotFoundError('No movies found.')
    }

    res.status(200).json(result.rows)
})

//get movie by name (slug)
movieRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug
    const result = await db.query(
        'SELECT m.slug, m.title, m.description, m.date_added, m.img, u.username AS author FROM movies AS m JOIN users AS u ON m.user_id = u.id WHERE m.slug = $1',
        [slug]
    )

    if (result.rowCount == 0) {
        throw new NotFoundError(`Movie "${slug}" not found.`)
    }

    res.status(200).json(result.rows[0])
})

//update movie by name (slug)
movieRouter.patch(
    '/:slug',
    authenticateToken,
    checkOwnerMovie,
    validateMovieExists,
    validateMovieReq,
    slugIdentifier,
    duplicateCheckMovie,
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
        if (incomingPatch.description) {
            fields.push(`description = $${fields.length + 1}`)
            values.push(incomingPatch.description)
        }

        //pushing initial slug to specify which entry to patch
        values.push(slug)

        const sql = `
    UPDATE movies
    SET ${fields.join(', ')}
    WHERE "slug" = $${values.length}
    RETURNING slug, title, description, date_added;
    `

        const result = await db.query(sql, values)

        res.status(200).json(result.rows[0])
    }
)

movieRouter.delete(
    '/:slug',
    authenticateToken,
    checkOwnerMovie,
    validateMovieExists,
    async (req, res) => {
        const slug = req.params.slug
        const result = await db.query('DELETE FROM movies WHERE slug = $1', [
            slug,
        ])
        res.status(204).end()
    }
)

movieRouter.post(
    '/',
    authenticateToken,
    validateMovieReq,
    slugIdentifier,
    duplicateCheckMovie,
    defaultImage,
    async (req, res) => {
        const incomingPost = req.body

        //Get user ID
        const userIdResult = await db.query(
            'SELECT id FROM users WHERE username = $1',
            [req.user.username]
        )
        const userId = userIdResult.rows[0].id

        const sql = `
            INSERT INTO movies (slug, title, description, date_added, img, user_id)
            VALUES ($1, $2, $3, NOW(), $4, $5)
            RETURNING slug, title, description, date_added, img;
        `

        const result = await db.query(sql, [
            incomingPost.slug,
            incomingPost.title,
            incomingPost.description || null,
            incomingPost.img || null,
            userId,
        ])

        result.rows[0].author = req.user.username
        res.status(201).json(result.rows[0])
    }
)

export default movieRouter
