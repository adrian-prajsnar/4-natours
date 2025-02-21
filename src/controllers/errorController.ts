import { NextFunction, Request, Response } from 'express'
import AppError from '../utils/appError'

interface SendErrorOptions {
  err: AppError
  res: Response
  status: string
  statusCode: number
}

const sendErrorDev = ({
  err,
  res,
  status,
  statusCode,
}: SendErrorOptions): void => {
  res.status(statusCode).json({
    status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = ({
  err,
  res,
  status,
  statusCode,
}: SendErrorOptions): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational)
    res.status(statusCode).json({
      status,
      message: err.message,
    })
  // Programming or other unknown error: don't leak error details
  else {
    console.error('ERROR ❌', err)
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    })
  }
}

function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode: number = err.statusCode || 500
  const status: string = err.status || 'error'

  const errorOptions: SendErrorOptions = { err, res, status, statusCode }

  if (process.env.NODE_ENV === 'development') sendErrorDev(errorOptions)
  else if (process.env.NODE_ENV === 'production') sendErrorProd(errorOptions)

  next()
}

export default globalErrorHandler
