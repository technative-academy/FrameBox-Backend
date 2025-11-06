import { Router } from 'express'
import {
    getTestMovie,
    getTestMovies,
    updateTestMovie,
} from '../test-values/movieTestValues.js'
import { db } from '../db/db.js'

const movieRouter = Router()

//get all movies
movieRouter.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM movies')
    res.status(200).json(result.rows)
})

//get movie by name (slug)
movieRouter.get('/:slug', async (req, res) => {
    const slug = req.params.slug
    const result = await db.query('SELECT * FROM movies WHERE slug = $1', [
        slug,
    ])
    result.rowCount == 0
        ? res.status(404).json({
              status: 404,
              message: `entry with the slug "${slug}" was not found.`,
          })
        : null
    res.status(200).json(result.rows)
})

movieRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
movieRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Movie created' })
})

export default movieRouter
