import { Router } from 'express'
import movieRouter from './routes/movieRouter.js'
import authRouter from './routes/authRouter.js'
import playlistRouter from './routes/playlistRouter.js'
import userRouter from './routes/userRouter.js'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'
import imageRouter from './routes/imageRouter.js'

const file = fs.readFileSync('src/docs/FrameBox.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
const router = Router()

router.use('/auth', authRouter)
router.use('/movies', movieRouter)
router.use('/playlists', playlistRouter)
router.use('/users', userRouter)
router.use('/images', imageRouter)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default router
