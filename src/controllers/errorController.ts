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

const handleValidationErrorDb = (err: AppError) => {
  const errors = Object.values(err.errors ?? {}).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJwtError = () =>
  new AppError('Invalid token. Please log in again!', 401)

const handleJwtExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401)

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

const getErrorStatus = (err: AppError) => ({
  statusCode: err.statusCode || 500,
  status: err.status || 'error',
})

function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const devErr = err
  let prodErr = err

  if (process.env.NODE_ENV === 'development') {
    const { status, statusCode } = getErrorStatus(devErr)
    sendErrorDev({ err: devErr, res, status, statusCode })
  }

  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') prodErr = handleCastErrorDb(prodErr)
    if (err.code === 11000) prodErr = handleDuplicateFieldsDb(prodErr)
    if (err.name === 'ValidationError')
      prodErr = handleValidationErrorDb(prodErr)
    if (err.name === 'JsonWebTokenError') prodErr = handleJwtError()
    if (err.name === 'TokenExpiredError') prodErr = handleJwtExpiredError()

    const { status, statusCode } = getErrorStatus(prodErr)
    sendErrorProd({ err: prodErr, res, status, statusCode })
  }

  next()
}

export default globalErrorHandler
