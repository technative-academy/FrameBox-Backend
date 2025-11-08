import { Router } from 'express'
import { db } from '../db/db.js'
import slugify from 'slugify'
import NotFoundError from '../errors/NotFoundError.js'
import {
    validateMovieExists,
    validateMovieReq,
} from '../middleware/validateMovie.js'
import { slugIdentifier } from '../middleware/slugIdentifier.js'
import { dupilcateCheckMovie } from '../middleware/duplicateCheck.js'

const movieRouter = Router()

//get all movies
movieRouter.get('/', async (req, res) => {
    const result = await db.query(
        'SELECT m.slug, m.title, m.description, m.date_added, m.img FROM movies AS m'
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
        'SELECT m.slug, m.title, m.description, m.date_added, m.img FROM movies AS m WHERE slug = $1',
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
    validateMovieExists,
    validateMovieReq,
    slugIdentifier,
    dupilcateCheckMovie,
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
        if (incomingPatch.img) {
            fields.push(`img = $${fields.length + 1}`)
            values.push(incomingPatch.img)
        }

        //pushing initial slug to specify which entry to patch
        values.push(slug)

        const sql = `
    UPDATE movies
    SET ${fields.join(', ')}
    WHERE "slug" = $${values.length}
    RETURNING slug, title, description, date_added, img;
    `

        const result = await db.query(sql, values)

        res.status(200).json({
            message: `Entry "${slug}" has been succesfully updated.`,
            movie: result.rows[0],
        })
    }
)

movieRouter.delete('/:slug', validateMovieExists, async (req, res) => {
    const slug = req.params.slug
    const result = await db.query('DELETE FROM movies WHERE slug = $1', [slug])
    res.status(204).end()
})

movieRouter.post(
    '/',
    validateMovieReq,
    slugIdentifier,
    dupilcateCheckMovie,
    async (req, res) => {
        const incomingPost = req.body

        const sql = `
            INSERT INTO movies (slug, title, description, date_added, img)
            VALUES ($1, $2, $3, NOW(), $4)
            RETURNING slug, title, description, date_added, img;
        `

        const result = await db.query(sql, [
            incomingPost.slug,
            incomingPost.title,
            incomingPost.description || null,
            incomingPost.img || null,
        ])

        res.status(201).json({
            message: `Movie "${incomingPost.title}" has been successfully created.`,
            movie: result.rows[0],
        })
    }
)

export default movieRouter
