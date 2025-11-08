import InvalidDataError from '../errors/InvalidDataError.js'
import NotFoundError from '../errors/NotFoundError.js'
import { db } from '../db/db.js'

const MAX_TEXT_LENGTH = 2000

export function validateMovieReq(req, res, next) {
    const reqObjKeys = Object.keys(req.body)
    const { title, description, img } = req.body

    // if req.body is empty
    if (reqObjKeys.length === 0) {
        throw new InvalidDataError('No data provided for update / creation.')
    }

    // if POST and title not given
    if (req.method === 'POST' && title === undefined) {
        throw new InvalidDataError('Title is required for movie creation.')
    }

    // if PATCH and title not given
    if (req.method === 'PATCH' && title === undefined) {
        req.body.title = req.params.slug
    }

    // if no valid key is present
    if (!['title', 'description', 'img'].some((key) => key in req.body)) {
        throw new InvalidDataError(
            'No valid keys provided for update / creation.'
        )
    }

    // if title is empty
    if (title !== undefined && title.trim() === '') {
        throw new InvalidDataError('Title cannot be empty.')
    }

    // if things aren't string, make them string
    if (title !== undefined) {
        req.body.title = String(title)
    }

    if (description !== undefined) {
        req.body.description = String(description)
    }

    if (img !== undefined) {
        req.body.img = String(img)
    }

    // if unnecessary keys exist, delete them
    // also check nothing goes over text character limit
    for (const key of reqObjKeys) {
        if (!['title', 'description', 'img'].includes(key)) {
            delete req.body.key
        } else if (req.body[key].length > MAX_TEXT_LENGTH) {
            throw new InvalidDataError(
                `${key} exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`
            )
        }
    }

    /*  extra checks that can be added
        - limit characters to number/letters/spaces/commom punctuation
        - limit image url to specific domain
        - cant think of any more right now
    */

    next()
}

export async function validateMovieExists(req, res, next) {
    const slug = req.params.slug
    const result = await db.query(
        'SELECT m.slug FROM movies AS m WHERE slug = $1',
        [slug]
    )
    if (result.rowCount == 0) {
        throw new NotFoundError(`Movie "${slug}" not found.`)
    }

    next()
}
