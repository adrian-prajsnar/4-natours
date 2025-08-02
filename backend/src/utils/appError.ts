class AppError extends Error {
  statusCode: number
  status: string
  isOperational: boolean
  path?: string
  value?: string
  code?: number
  errorResponse?: {
    errmsg?: string
  }
  errors?: Record<
    string,
    {
      message?: string
      path?: string
      value?: unknown
      kind?: string
      properties?: Record<string, unknown>
    }
  >

  constructor(message: string, statusCode: number) {
    super(message)

    this.statusCode = statusCode
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError
