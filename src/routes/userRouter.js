import { Router } from 'express'
import { getTestUser } from '../test-values/userTestValues.js'

const movieRouter = Router()

movieRouter.get('/:slug', getTestUser)

export default movieRouter
