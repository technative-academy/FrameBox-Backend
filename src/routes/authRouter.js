import { Router } from 'express'
import {
    registerUser,
    loginUser,
    refreshAccessToken,
} from '../services/auth.js'
import { slugIdentifier } from '../middleware/slugIdentifier.js'
import UnauthorisedError from '../errors/UnauthorisedError.js'

const authRouter = Router()

authRouter.post('/register', slugIdentifier, async (req, res) => {
    const { username, email, password, slug } = req.body
    const user = await registerUser(username, email, password, slug)
    res.status(201).json(user)
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body
    const { username, accessToken, refreshToken } = await loginUser(
        email,
        password
    )

    // Set the refresh token as an HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Send the access token with the user data in the response
    res.json({ username, accessToken })
})

authRouter.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new UnauthorisedError('Refresh token not provided')
    }

    const newAccessToken = await refreshAccessToken(refreshToken)
    res.json({ accessToken: newAccessToken })
})

authRouter.post('/logout', (req, res) => {
    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out' })
})

export default authRouter
