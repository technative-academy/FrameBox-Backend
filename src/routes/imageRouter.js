import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { db } from '../db/db.js'
import fs from 'fs'
import authenticateToken from '../middleware/auth.js'

dotenv.config()
const imageRouter = Router()
const upload = multer({ dest: './uploads/' }) // temporary storage

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

imageRouter.get(
    '/',
    //authenticateToken,
    (req, res) => {
        res.send(`
    <h1>File Upload Demo</h1>
    <form action="images/playlists/inception" method="post" enctype="multipart/form-data">
        <input type="file" name="image" />
        <button type="submit">Upload</button>
    </form>
    `)
    }
)

// Upload endpoint
imageRouter.post(
    '/playlists/:slug',
    upload.single('image'),
    async (req, res) => {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'user_uploads',
        })
        const slug = req.params.slug
        const table = `playlists`

        await fs.promises.unlink(req.file.path)

        const url = cloudinary.url(result.public_id, {
            transformation: [
                { height: 700, width: 700, crop: 'fill' },
                { quality: 'auto:low' },
            ],
        })

        const resultDb = await db.query(
            `UPDATE ${table} SET img = $1 WHERE slug = $2`,
            [url, slug]
        )
        res.json({ imageUrl: url })
    }
)
// Upload endpoint
imageRouter.post('/movies/:slug', upload.single('image'), async (req, res) => {
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user_uploads',
    })
    const slug = req.params.slug
    const table = `movies`

    await fs.promises.unlink(req.file.path)

    const url = cloudinary.url(result.public_id, {
        transformation: [
            {
                width: 400,
                height: 450,
            },
        ],
    })

    const resultDb = await db.query(
        `UPDATE ${table} SET img = $1 WHERE slug = $2`,
        [url, slug]
    )
    res.json({ imageUrl: url })
})

export default imageRouter
