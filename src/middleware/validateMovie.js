import InvalidDataError from '../errors/InvalidDataError.js'

export function validateMovieUpdate(req, res, next) {
    const resObjKeys = Object.keys(req.body)
    const { title } = req.body

    if (resObjKeys.length === 0) {
        throw new InvalidDataError('No data provided for update.')
    }

    if (!['title', 'description', 'img'].some((key) => key in req.body)) {
        throw new InvalidDataError('No valid keys provided for update.')
    }

    if (title && title === '') {
        throw new InvalidDataError('Title cannot be empty.')
    }

    for (key of resObjKeys) {
        if (!['title', 'description', 'img'].includes(key)) {
            delete req.body[key]
        }
    }

    next()
}
