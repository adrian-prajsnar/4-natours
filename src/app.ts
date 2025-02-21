import express, { Express, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import AppError from './utils/appError'
import toursRouter from './routes/tours'
import usersRouter from './routes/users'
import globalErrorHandler from './controllers/errorController'

declare module 'express-serve-static-core' {
  interface Request {
    requestTime?: string
  }
}

// 1) MIDDLEWARES

export const app: Express = express()

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))
app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) MOUNTING ROUTES
app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)
