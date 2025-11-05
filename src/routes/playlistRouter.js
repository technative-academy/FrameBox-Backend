import { Router } from 'express'

const playlistRouter = Router()

playlistRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'List of playlists' })
})

export default playlistRouter
