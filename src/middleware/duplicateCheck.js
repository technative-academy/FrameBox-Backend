import ConflictError from '../errors/ConflictError'
import { db } from '../db/db.js'

export async function dupilcateCheckMovie(req, res, next) {
    const slug = req.body.slug
    const targetSlug = req.params.slug

    // if patching, only check for duplicate if slug is changing
    if (req.method === 'PATCH' && slug === targetSlug) {
        return next()
    }

    const query = 'SELECT COUNT(*) FROM movies WHERE slug = $1'
    const result = await db.query(query, [slug])
    if (parseInt(result.rows[0].count) > 0) {
        throw new ConflictError(`Movie with slug "${slug}" already exists.`)
    }

    next()
}
