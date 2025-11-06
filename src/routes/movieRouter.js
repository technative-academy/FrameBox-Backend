import { Router } from 'express'
import {
    getTestMovie,
    getTestMovies,
    updateTestMovie,
} from '../test-values/movieTestValues.js'

const movieRouter = Router()

movieRouter.get('/', getTestMovies)
movieRouter.get('/:slug', getTestMovie)
movieRouter.patch('/:slug', updateTestMovie)
movieRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
movieRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Movie created' })
})

export default movieRouter
