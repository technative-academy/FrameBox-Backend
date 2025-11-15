import ConflictError from '../errors/ConflictError.js'
import { db } from '../db/db.js'

const dupeCheckMovieQuery = 'SELECT COUNT(*) FROM movies WHERE slug = $1'
const dupeCheckPlaylistQuery = 'SELECT COUNT(*) FROM playlists WHERE slug = $1'

// requires slug to be set in body
function createDuplicateCheck(tableQuery) {
    return async function dupilcateCheckMovie(req, res, next) {
        const slug = req.body.slug

        // if patching, only check for duplicate if slug is changing
        if (req.method === 'PATCH') {
            if (slug === req.params.slug) {
                return next()
            }
        }

        const result = await db.query(tableQuery, [slug])
        if (parseInt(result.rows[0].count) > 0) {
            throw new ConflictError(`Movie with slug "${slug}" already exists.`)
        }

        next()
    }
}

export const duplicateCheckMovie = createDuplicateCheck(dupeCheckMovieQuery)
export const duplicateCheckPlaylist = createDuplicateCheck(
    dupeCheckPlaylistQuery
)
