process.on('uncaughtException', (err: Error) => {
  console.error('UNHANDLED EXCEPTION! ❌ Shutting down...')
  console.error(err)
  process.exit(1)
})

import dotenv from 'dotenv'

dotenv.config({
  path: ['.env.local', '.env'],
})

import { app } from './app'
import mongoose from 'mongoose'

const port: string = process.env.SERVER_PORT ?? '3000'
const dbConnectionString: string =
  process.env.DATABASE_URL?.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD ?? ''
  ) ?? ''

let server: ReturnType<typeof app.listen>

async function connectToDatabase() {
  try {
    await mongoose.connect(dbConnectionString)
    console.log('✅ Database connection successful!')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    process.exit(1)
  }
}

async function startServer() {
  try {
    await connectToDatabase()
    server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`)
    })
  } catch (error) {
    console.error('❌ Error starting the server:', error)
  }
}

void startServer()

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! ❌ Shutting down...')
  console.log(err)
  server.close(() => process.exit(1))
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('❌ Process terminated!')
  })
})
