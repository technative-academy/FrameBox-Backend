import { Router } from 'express'

const movieRouter = Router()

movieRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'List of movies' })
})

export default movieRouter
