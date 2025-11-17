import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { db } from '../db/db.js'
import fs from 'fs'
import authenticateToken from '../middleware/auth.js'
import { imageFileFilter } from '../services/fileFilter.js'
import { validateImageSuccessfulUpload } from '../middleware/validate.js'

dotenv.config()
const imageRouter = Router()
const upload = multer({
    dest: './uploads/',
    limits: {
        fileSize: 0.5 * 1024 * 1024, //0.5MB
    },
    fileFilter: imageFileFilter,
}) // temporary storage, file size limits and sets fileFilter

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
    validateImageSuccessfulUpload,
    async (req, res) => {
        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'FrameBox Image Upload',
        })
        const slug = req.params.slug

        await fs.promises.unlink(req.file.path)

        //Set temp image and store image id
        const url = cloudinary.url('awaiting_700_lqzlpx')
        const publicId = result.public_id

        const resultDb = await db.query(
            `UPDATE playlists SET img = $1, img_id = $2 WHERE slug = $3`,
            [url, publicId, slug]
        )
        res.json({ imageUrl: url })
    }
)
// Upload endpoint
imageRouter.post(
    '/movies/:slug',
    upload.single('image'),
    validateImageSuccessfulUpload,
    async (req, res) => {
        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: 'FrameBox Image Upload',
        })
        const slug = req.params.slug

        await fs.promises.unlink(req.file.path)

        //Set temp image and store image id
        const url = cloudinary.url('awaiting_700_lqzlpx')
        const publicId = result.public_id

        const resultDb = await db.query(
            `UPDATE movies SET img = $1, img_id = $2 WHERE slug = $3`,
            [url, publicId, slug]
        )
        res.json({ imageUrl: url })
    }
)

export default imageRouter
