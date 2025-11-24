import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { db } from '../db/db.js'
import fs from 'fs'
import { imageFileFilter } from '../services/fileFilter.js'
import ForbiddenError from '../errors/ForbiddenError.js'
import {
    checkOwnerMovie,
    checkOwnerPlaylist,
    validateImageSuccessfulUpload,
    validateMovieExists,
    validatePlaylistExists,
} from '../middleware/validate.js'
import authenticateToken from '../middleware/auth.js'

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

imageRouter.get('/', authenticateToken, (req, res) => {
    res.send(`
    <h1>File Upload Demo</h1>
    <form action="playlists/inception" method="post" enctype="multipart/form-data">
        <input type="file" name="image" />
        <button type="submit">Upload</button>
    </form>
    `)
})

// Upload endpoint
imageRouter.post(
    '/playlists/:slug',
    authenticateToken,
    validatePlaylistExists,
    checkOwnerPlaylist,
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
    authenticateToken,
    validateMovieExists,
    checkOwnerMovie,
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

//webhook for cloudinary moderation
imageRouter.post('/cloudinary/webhook', async (req, res) => {
    //verify that cloudinary is the client
    const raw = req.rawBody.toString('utf8')
    const timestamp = req.header('X-Cld-Timestamp')
    const signature = req.header('X-Cld-Signature')

    console.log(req.body)
    console.log('---------')
    console.log(raw)
    console.log(timestamp)
    console.log(signature)

    const isCloudinary = cloudinary.utils.verifyNotificationSignature(
        raw,
        timestamp,
        signature,
        600
    )

    console.log(`Was it Cloudinary? ${isCloudinary}`)
    if (!isCloudinary) {
        throw new ForbiddenError('Cloudinary signature verification failed')
    }

    //Then use notification to update img
    const data = JSON.parse(raw)

    const { public_id, moderation_status, secure_url } = data

    if (!public_id || !moderation_status) {
        return res.status(200).end()
    }

    if (moderation_status !== 'approved') {
        return res.status(200).end()
    }

    const url = secure_url || cloudinary.url(public_id)

    const movieRes = await db.query(
        `UPDATE movies
             SET approved = true, img = $1
             WHERE img_id = $2`,
        [url, public_id]
    )

    if (movieRes.rowCount > 0) {
        return res.status(200).end()
    }

    const playlistRes = await db.query(
        `UPDATE playlists
             SET approved = true, img = $1
             WHERE img_id = $2`,
        [url, public_id]
    )

    return res.status(200).end()
})

export default imageRouter
