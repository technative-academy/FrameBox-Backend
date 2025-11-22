class ForbiddenError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 403
        this.name = 'ForbiddenError'
    }

    toJSON() {
        return {
            error: this.name,
            code: this.statusCode,
            message: this.message,
        }
    }
}

export default ForbiddenError
