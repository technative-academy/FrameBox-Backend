import { Router } from 'express'
import {
    getTestMovie,
    getTestMovies,
    updateTestMovie,
} from '../test-values/movieTestValues.js'
import { db } from '../db/db.js'

const movieRouter = Router()

movieRouter.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM movies')
    res.status(200).json(result.rows)
})
movieRouter.get('/:slug', getTestMovie)
movieRouter.patch('/:slug', updateTestMovie)
movieRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
movieRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Movie created' })
})

export default movieRouter
