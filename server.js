import express from 'express'
import dotenv from 'dotenv'
import routes from './src/routes.js'
import NotFoundError from './src/errors/NotFoundError.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf
        },
    })
)

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}

app.use(cors(corsOptions))
app.use(cookieParser())

app.use('/api', routes)
app.get('/test', (req, res) => {
    res.status(200).json({ it_is: 'working!' })
})

app.all('*splat', (req, res) => {
    throw new NotFoundError('404 Page Not Found')
})

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
    console.error(err)
    const status = err.statusCode || 500
    if (typeof err.toJSON === 'function') {
        return res.status(status).json(err.toJSON())
    }

    return res.status(status).json({ error: err.name || 'Error', code: status, message: err.message || 'Internal Server Error' })
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
})
