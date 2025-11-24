class BadRequestError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 400
        this.name = 'BadRequestError'
    }

    toJSON() {
        return {
            error: this.name,
            code: this.statusCode,
            message: this.message,
        }
    }
}

export default BadRequestError
