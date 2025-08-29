import express, { Express, NextFunction, Request, Response } from 'express'
import path from 'path'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import sanitizeHtml from 'sanitize-html'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import AppError from './utils/appError'
import viewsRouter from './routes/viewRoutes'
import toursRouter from './routes/tourRoutes'
import usersRouter from './routes/userRoutes'
import reviewsRouter from './routes/reviewRoutes'
import bookingsRouter from './routes/bookingRoutes'
import globalErrorHandler from './controllers/errorController'

declare module 'express-serve-static-core' {
  interface Request {
    requestTime?: string
  }
}

export const app: Express = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(
  express.static(path.join(__dirname, '..', '..', 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8')
      }
    },
  })
)

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com',
          "'unsafe-inline'",
          "'unsafe-eval'",
        ],
        workerSrc: ["'self'", 'blob:'],
        styleSrc: [
          "'self'",
          'https://api.mapbox.com',
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://api.stripe.com',
          process.env.NODE_ENV === 'development' ? 'ws://localhost:1234' : '',
        ].filter(Boolean),
        frameSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://checkout.stripe.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
)

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
app.use(express.json({ limit: '10kb' }))
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
)
app.use(cookieParser())

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

// Test middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.headers)
  // console.log(req.cookies)
  next()
})

// 2) MOUNTING ROUTES

app.use('/', viewsRouter)
app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/reviews', reviewsRouter)
app.use('/api/v1/bookings', bookingsRouter)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)
