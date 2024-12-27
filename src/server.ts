import dotenv from 'dotenv'

dotenv.config({
    path: ['.env.local', './config.env'],
})

import { app } from './app'
import mongoose from 'mongoose'

const port: string = process.env.SERVER_PORT ?? '3000'
const dbConnectionString: string =
    process.env.DATABASE_URL?.replace(
        '<db_password>',
        process.env.DATABASE_PASSWORD ?? ''
    ) ?? ''

async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`App running on port ${port}...`)
        })

        await mongoose.connect(dbConnectionString)
        console.log('Database connection successful!')
    } catch (error) {
        console.error('Error starting the server:', error)
    }
}

void startServer()
