import slugify from 'slugify'

export function slugIdentifier(req, res, next) {
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
