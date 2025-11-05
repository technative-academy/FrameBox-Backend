import { Router } from 'express'
import {
    getTestPlaylist,
    getTestPlaylists,
    updateTestPlaylist,
} from '../test-values/playlistTestValues'

const playlistRouter = Router()

playlistRouter.get('/', (req, res) => {
    res.status(200).json(getTestPlaylists())
})

playlistRouter.get('/:slug', (req, res) => {
    const { slug } = req.params
    const playlist = getTestPlaylist(slug)
    if (playlist) {
        res.status(200).json(playlist)
    } else {
        res.status(404).json({ message: 'Playlist not found' })
    }
})

playlistRouter.patch('/:slug', (req, res) => {
    const { slug } = req.params
    const playlist = updateTestPlaylist(slug)
    if (playlist) {
        res.status(200).json(playlist)
    } else {
        res.status(404).json({ message: 'Playlist not found' })
    }
})

playlistRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})

playlistRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Playlist created' })
})

export default playlistRouter
