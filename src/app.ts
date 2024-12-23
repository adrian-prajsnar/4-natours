import express, { Express, NextFunction, Request, Response } from 'express'
import morgan from 'morgan'
import toursRouter from './routes/tours'
import usersRouter from './routes/users'

declare module 'express-serve-static-core' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
        requestTime?: string
    }
}

// 1) MIDDLEWARES

export const app: Express = express()

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))
app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use((_req: Request, _res: Response, next: NextFunction) => {
    console.log('Hello from the middleware... 👋')
    next()
})
app.use((req: Request, _res: Response, next: NextFunction) => {
    req.requestTime = new Date().toISOString()
    next()
})

// 2) MOUNTING ROUTES
app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)
