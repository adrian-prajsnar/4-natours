import fs from 'fs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Tour } from '../../src/models/tourModel'
import { User } from '../../src/models/userModel'
import { Review } from '../../src/models/reviewModel'

dotenv.config({
  path: ['.env.local', '.env'],
})

async function connectToDb(): Promise<void> {
  const dbConnectionString: string =
    process.env.DATABASE_URL?.replace(
      '<db_password>',
      process.env.DATABASE_PASSWORD ?? ''
    ) ?? ''

  await mongoose
    .connect(dbConnectionString)
    .then(() => {
      console.log('Database connection successful')
    })
    .catch((error: unknown) => {
      console.error('Error starting the server:', error)
    })
}

void connectToDb()

const tours: string = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
const users: string = fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
const reviews: string = fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')

async function importData(): Promise<void> {
  try {
    await Tour.create(JSON.parse(tours))
    await User.create(JSON.parse(users), { validateBeforeSave: false })
    await Review.create(JSON.parse(reviews))
    console.log('Data successfully imported!')
  } catch (error) {
    console.error('Error importing data', error)
  } finally {
    process.exit()
  }
}

async function deleteData(): Promise<void> {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('Data successfully deleted!')
  } catch (error) {
    console.error('Error importing data', error)
  } finally {
    process.exit()
  }
}

if (process.argv[2] === '--import') void importData()
else if (process.argv[2] === '--delete') void deleteData()
