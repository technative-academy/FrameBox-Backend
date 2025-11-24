import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import UnauthorisedError from '../errors/UnauthorisedError.js'

// Load environment variables from a .env file
dotenv.config()

// Middleware function to authenticate a token
const authenticateToken = (req, res, next) => {
    // Get the authorization header from the request
    const authHeader = req.headers['authorization']

    // Extract the token from the header, if it exists
    const token = authHeader && authHeader.split(' ')[1]

    // If no token is found, throw an UnauthorisedError
    if (!token) throw new UnauthorisedError('No access token provided')

    // Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // If verification fails, pass the UnauthorisedError to next
        if (err) return next(new UnauthorisedError('Invalid or expired token'))

        // If verification is successful, attach the user object to the request
        req.user = user

        // Call the next middleware or route handler
        next()
    })
}

export default authenticateToken
