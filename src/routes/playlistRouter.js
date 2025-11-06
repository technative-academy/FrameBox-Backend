import { Router } from 'express'
import {
    getTestPlaylist,
    getTestPlaylists,
    updateTestPlaylist,
} from '../test-values/playlistTestValues.js'
import { db } from '../db/db.js'

const playlistRouter = Router()

playlistRouter.get('/', async (req, res) => {
    const result = await db.query(
        'SELECT p.slug, p.title, p.summary, p.date_created FROM playlists AS p'
    )
    res.status(200).json(result.rows)
})

playlistRouter.get('/:slug', getTestPlaylist)
playlistRouter.patch('/:slug', updateTestPlaylist)
playlistRouter.delete('/:slug', (req, res) => {
    res.status(204).end()
})
playlistRouter.post('/', (req, res) => {
    res.status(201).json({ message: 'Playlist created' })
})

export default playlistRouter
