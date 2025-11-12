import slugify from 'slugify'

export function slugIdentifier(req, res, next) {
    // if title or username is present in req.body, create slug
    // specify title and username so it works for movies, playlists and users

    if (['title', 'username'].some((key) => key in req.body)) {
        const title = req.body.title || req.body.username
        const slug = slugify(title, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,
        })
        req.body.slug = slug
    }

    next()
}
