class ConflictError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 409
        this.name = 'ConflictError'
    }
}

export default ConflictError
