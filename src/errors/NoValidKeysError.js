class InvalidDataError extends Error {
    constructor(message) {
        super(message)
        this.statusCode = 400
        this.name = 'InvalidDataError'
    }
}

export default InvalidDataError
