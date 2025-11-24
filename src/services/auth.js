import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { db } from '../db/db.js'
import ConflictError from '../errors/ConflictError.js'
import UnauthorisedError from '../errors/UnauthorisedError.js'

dotenv.config()

// Function to generate an access token that expires in 15 mins
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_EXPIRY_TIME,
    })
}

// Function to generate a refresh token that expires in 7 days
const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRY_TIME,
    })
}

const registerUser = async (username, email, password, slug) => {
    // Check if the email already exists
    const emailCheckResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    )
    if (emailCheckResult.rows.length > 0) {
        throw new ConflictError('Email already exists')
    }

    // If the email does not exist, proceed with registration
    // hash the password and insert the new user into the database
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.query(
        'INSERT INTO users (username, email, password, slug, date_joined) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [username, email, hashedPassword, slug]
    )

    // Return the newly created user
    return result.rows[0]
}

const loginUser = async (email, password) => {
    // Query the database for the user with the provided email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
        email,
    ])

    const user = result.rows[0]

    // If the user exists and the password matches, generate access and refresh tokens
    if (user && (await bcrypt.compare(password, user.password))) {
        const userData = { username: user.username, email: user.email }
        const accessToken = generateAccessToken(userData)
        const refreshToken = generateRefreshToken(userData)

        return {
            username: user.username,
            accessToken,
            refreshToken,
        }
    }

    // Throw an error if the email or password is invalid
    throw new UnauthorisedError('Invalid email or password')
}

const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify the refresh token
        const user = await jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const userData = { username: user.username, email: user.email }
        // Generate and return a new access token
        return generateAccessToken(userData)
    } catch (err) {
        // Throw an error if the refresh token is invalid
        throw new UnauthorisedError('Invalid refresh token')
    }
}

export { registerUser, loginUser, refreshAccessToken }
