import { Router } from 'express'
import {
    getTestPlaylist,
    getTestPlaylists,
} from '../test-values/playlistTestValues.js'

const playlistRouter = Router()

playlistRouter.get('/', getTestPlaylists)
playlistRouter.get('/:slug', getTestPlaylist)
playlistRouter.patch('/:slug', getTestPlaylist)
playlistRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
playlistRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Playlist created' })
})

export default playlistRouter
