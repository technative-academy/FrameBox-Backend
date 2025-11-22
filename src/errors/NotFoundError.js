class NotFoundError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 404
        this.name = 'NotFoundError'
    }

    toJSON() {
        return { error: this.name, code: this.statusCode, message: this.message }
    }
}

export default NotFoundError
