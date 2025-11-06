import { Router } from 'express'
import movieRouter from './routes/movieRouter.js'
import authRouter from './routes/authRouter.js'
import playlistRouter from './routes/playlistRouter.js'
import userRouter from './routes/userRouter.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/movies', movieRouter)
router.use('/playlists', playlistRouter)
router.use('/users', userRouter)

export default router
