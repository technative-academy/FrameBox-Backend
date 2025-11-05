import { Router } from 'express'

const authRouter = Router()

authRouter.post('/login', (req, res) => {
    res.status(200).json({ message: 'User logged in' })
})

export default authRouter
