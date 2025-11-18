import InvalidDataError from '../errors/InvalidDataError.js'
import NotFoundError from '../errors/NotFoundError.js'
import { db } from '../db/db.js'

const MAX_TEXT_LENGTH = 2000
const playlistObjKeys = ['title', 'summary']
const movieObjKeys = ['title', 'description', 'img']
const movieExist = 'SELECT slug FROM movies WHERE slug = $1'
const playlistExist = 'SELECT slug FROM playlists WHERE slug = $1'

function createValidateReq(schemaObject) {
    return function validateReq(req, res, next) {
        const reqObjKeys = Object.keys(req.body)
        const { title } = req.body

        // if req.body is empty
        if (reqObjKeys.length === 0) {
            throw new InvalidDataError(
                'No data provided for update / creation.'
            )
        }

        // if POST and title not given
        if (req.method === 'POST' && title === undefined) {
            throw new InvalidDataError('Title is required for movie creation.')
        }

        // if no valid key is present
        if (!schemaObject.some((key) => key in req.body)) {
            throw new InvalidDataError(
                'No valid keys provided for update / creation.'
            )
        }

        // if title is empty
        if (title !== undefined && title.trim() === '') {
            throw new InvalidDataError('Title cannot be empty.')
        }

        // if unnecessary keys exist, delete them
        // also make it all strings
        // also check nothing goes over text character limit
        for (const key of reqObjKeys) {
            if (!schemaObject.includes(key)) {
                delete req.body[key]
            } else {
                if (req.body[key] !== undefined) {
                    req.body[key] = String(req.body[key])
                }
                if (req.body[key].length > MAX_TEXT_LENGTH) {
                    throw new InvalidDataError(
                        `${key} exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`
                    )
                }
            }
        }

        /*  extra checks that can be added
        - limit characters to number/letters/spaces/commom punctuation
        - limit image url to specific domain
        - cant think of any more right now
        */

        next()
    }
}

export const validateMovieReq = createValidateReq(movieObjKeys)
export const validatePlaylistReq = createValidateReq(playlistObjKeys)

function createValidateExists(tableQuery) {
    return async function validateExists(req, res, next) {
        const slug = req.params.slug
        const result = await db.query(tableQuery, [slug])
        if (result.rowCount == 0) {
            throw new NotFoundError(`"${slug}" not found.`)
        }

        next()
    }
}

export const validateMovieExists = createValidateExists(movieExist)
export const validatePlaylistExists = createValidateExists(playlistExist)

export function validateMovieArray(req, res, next) {
    const { movies } = req.body

    if (!movies || !Array.isArray(movies)) {
        throw new InvalidDataError('No valid movies array provided.')
    }

    if (movies.length === 0) {
        throw new InvalidDataError('Movies array cannot be empty.')
    }

    if (
        !movies.every((item) => typeof item === 'string' && item.trim() !== '')
    ) {
        throw new InvalidDataError('All movies must be non-empty strings.')
    }

    if (!movies.every((item) => item.length <= MAX_TEXT_LENGTH)) {
        throw new InvalidDataError(
            `Each movie title must be at most ${MAX_TEXT_LENGTH} characters.`
        )
    }

    next()
}

export async function validateMoviesExistArray(req, res, next) {
    const { movies } = req.body
    const { slug } = req.params

    const result = await db.query(
        `SELECT slug FROM movies WHERE slug = ANY($1)`,
        [movies]
    )
    const existingMovies = result.rows.map((row) => row.slug)
    const missingMovies = movies.filter(
        (slug) => !existingMovies.includes(slug)
    )

    if (missingMovies.length > 0) {
        throw new InvalidDataError(
            `Some movies do not exist in our database: ${missingMovies.join(
                ', '
            )}`
        )
    }

    const playlistMoviesQuery = await db.query(
        `SELECT m.slug FROM movies m 
            JOIN playlist_movies pm ON pm.movie_id = m.id
            JOIN playlists p ON p.id = pm.playlist_id
            WHERE p.slug = $1 `,
        [slug]
    )
    const playlistMovies = playlistMoviesQuery.rows.map((row) => row.slug)

    const alreadyInPlaylist = movies.filter((slug) =>
        playlistMovies.includes(slug)
    )
    if (req.method === 'POST' && alreadyInPlaylist.length > 0) {
        throw new InvalidDataError(
            `Some movies are already in the playlist: ${alreadyInPlaylist.join(
                ', '
            )}`
        )
    }
    const notInPlaylist = movies.filter(
        (slug) => !playlistMovies.includes(slug)
    )
    if (req.method === 'DELETE' && notInPlaylist.length > 0) {
        throw new InvalidDataError(
            `Some movies are not in the playlist: ${notInPlaylist.join(', ')}`
        )
    }

    next()
}

export function validateImageSuccessfulUpload(req, res, next) {
    if (!req.file) {
        throw new InvalidDataError('Invalid file type')
    }

    next()
}
