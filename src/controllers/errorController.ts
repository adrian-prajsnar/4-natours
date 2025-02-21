import { NextFunction, Request, Response } from 'express'
import AppError from '../utils/appError'

interface SendErrorOptions {
  err: AppError
  res: Response
  status: string
  statusCode: number
}

const handleCastErrorDb = (err: AppError) => {
  const message = `Invalid ${err.path ?? 'unknown path'}: ${err.value ?? 'unknown value'}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDb = (err: AppError) => {
  const value = err.errorResponse?.errmsg?.match(/"([^"]+)"/)?.at(0)
  const message = `Duplicated field value: ${value ?? 'unknown value'}. Please use another value!`
  return new AppError(message, 400)
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

  if (process.env.NODE_ENV === 'development')
    sendErrorDev({ err, res, status, statusCode })
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }

    if (err.name === 'CastError') error = handleCastErrorDb(error)
    if (err.code === 11000) error = handleDuplicateFieldsDb(error)

    sendErrorProd({ err: error, res, status, statusCode })
  }

  next()
}

export default globalErrorHandler
