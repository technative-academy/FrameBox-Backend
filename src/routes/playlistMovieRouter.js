import { Router } from 'express'
import { addRemoveTestMoviesFromPlaylist } from '../test-values/playlistTestValues.js'

const playlistMovieRouter = Router()

playlistMovieRouter
    .route('/')
    .post(addRemoveTestMoviesFromPlaylist)
    .delete(addRemoveTestMoviesFromPlaylist)

export default playlistMovieRouter
