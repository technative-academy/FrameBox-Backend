import InvalidDataError from '../errors/InvalidDataError'

//Checks file type
export function imageFileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png']

    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new InvalidDataError('Invalid file type'), false)
    }
}
