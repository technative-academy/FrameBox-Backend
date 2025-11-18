import express from 'express'
import dotenv from 'dotenv'
import routes from './src/routes.js'
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
app.use(cors())
app.use(cookieParser())

app.use('/api', routes)
app.get('/test', (req, res) => {
    res.status(200).json({ it_is: 'working!' })
})
app.all('*splat', (req, res) => {
    res.status(404).send('404 Page Not Found')
})

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.statusCode || 500).send(err.message)
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
})
