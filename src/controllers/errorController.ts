import { NextFunction, Request, Response } from 'express'
import AppError from '../utils/appError'

function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode: number = err.statusCode || 500
  const status: string = err.status || 'error'

  res.status(statusCode).json({
    status,
    message: err.message,
  })

  next()
}

export default globalErrorHandler
