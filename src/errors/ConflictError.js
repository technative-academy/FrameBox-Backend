class ConflictError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 409
        this.name = 'ConflictError'
    }

    toJSON() {
        return { error: this.name, code: this.statusCode, message: this.message }
    }
}

export default ConflictError
