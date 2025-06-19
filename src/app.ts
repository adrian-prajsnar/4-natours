import express, { Express, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import AppError from './utils/appError'
import toursRouter from './routes/tourRotes'
import usersRouter from './routes/userRoutes'
import globalErrorHandler from './controllers/errorController'

declare module 'express-serve-static-core' {
  interface Request {
    requestTime?: string
  }
}

export const app: Express = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
)

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.headers)
  next()
})

// 2) MOUNTING ROUTES
app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)
