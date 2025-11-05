import express from 'express'
import fs from 'node:fs/promises'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const port = process.env.PORT || 3000

app.get('/test', (req, res) => {
    res.status(200).json({ it_is: 'working!' })
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
})
