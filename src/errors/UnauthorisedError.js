class UnauthorisedError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 401
        this.name = 'UnauthorisedError'
    }
}

export default UnauthorisedError
