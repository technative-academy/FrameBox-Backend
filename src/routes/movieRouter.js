import { Router } from 'express'
import {
    getTestMovie,
    getTestMovies,
    updateTestMovie,
} from '../test-values/movieTestValues.js'
import { db } from '../db/db.js'
import slugify from 'slugify'

const movieRouter = Router()

//get all movies
movieRouter.get('/', async (req, res) => {
    const result = await db.query(
        'SELECT m.slug, m.title, m.description, m.img FROM movies AS m'
    )
    res.status(200).json(result.rows)
})

//get movie by name (slug)
movieRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug
    const result = await db.query(
        'SELECT m.slug, m.title, m.description, m.img FROM movies AS m WHERE slug = $1',
        [slug]
    )
    result.rowCount == 0
        ? res.status(404).json({
              status: 404,
              message: `entry with the slug "${slug}" was not found.`,
          })
        : null
    res.status(200).json(result.rows)
})

//update movie by name (slug)
movieRouter.patch('/:slug', async (req, res) => {
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
    if (incomingPatch.description) {
        fields.push(`description = $${fields.length + 1}`)
        values.push(incomingPatch.description)
    }
    if (incomingPatch.img) {
        fields.push(`img = $${fields.length + 1}`)
        values.push(incomingPatch.img)
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update.' })
    }

    //pushing initial slug to specify which entry to patch
    values.push(slug)

    const sql = `
    UPDATE movies 
    SET ${fields.join(', ')} 
    WHERE "slug" = $${values.length}
    `

    const result = await db.query(sql, values)

    res.status(201).json(`Entry "${slug}" has been succesfully updated.`)
})

export default movieRouter
