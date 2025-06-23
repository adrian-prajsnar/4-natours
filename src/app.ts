import express, { Express, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import sanitizeHtml from 'sanitize-html'
import hpp from 'hpp'
import AppError from './utils/appError'
import toursRouter from './routes/tourRoutes'
import usersRouter from './routes/userRoutes'
import reviewRouter from './routes/reviewRoutes'
import globalErrorHandler from './controllers/errorController'

declare module 'express-serve-static-core' {
  interface Request {
    requestTime?: string
  }
}

export const app: Express = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS (html injection)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    const sanitizeObject = (
      obj: Record<string, unknown> | unknown[]
    ): Record<string, unknown> | unknown[] => {
      if (typeof obj !== 'object') return obj

      if (Array.isArray(obj)) {
        return obj.map(item =>
          typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown> | unknown[])
            : item
        )
      }

      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: 'recursiveEscape',
          })
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(
            value as Record<string, unknown> | unknown[]
          )
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }

    req.body = sanitizeObject(req.body as Record<string, unknown>)
  }
  next()
})

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
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
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)
