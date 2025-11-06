import { Router } from 'express'
import { getTestUser } from '../test-values/userTestValues.js'

const userRouter = Router()

userRouter.get('/:slug', getTestUser)

export default userRouter
