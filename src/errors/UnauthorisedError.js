class UnauthorisedError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 401
        this.name = 'UnauthorisedError'
    }

    toJSON() {
        return { error: this.name, code: this.statusCode, message: this.message }
    }
}

export default UnauthorisedError
