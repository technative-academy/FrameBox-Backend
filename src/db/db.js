import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
    host: process.env.DATABASE_HOSTNAME,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_NAME,
})

pool.connect()
    .then((client) => {
        console.log(`Connected to ${process.env.DATABASE_NAME} database!`)
        client.release()
    })
    .catch((err) => {
        console.error(
            `Error connecting to ${process.env.DATABASE_NAME} database:`,
            err
        )
    })

export { pool as db }
