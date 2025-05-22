import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { IUser, User } from '../models/userModel'
import { UserRole } from '../utils/enums'
import { getEnv } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import sendEmail from '../utils/email'

const signToken = (id: string) => {
  return jwt.sign({ id }, getEnv('JWT_SECRET'), {
    expiresIn: getEnv('JWT_EXPIRATION_TIME'),
  } as SignOptions)
}

export const signUp = catchAsync(
  async (
    req: Request<Record<string, never>, unknown, IUser>,
    res: Response
  ): Promise<void> => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })

    const token = signToken(newUser._id)

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    })
  }
)

export const login = catchAsync(
  async (
    req: Request<Record<string, never>, unknown, IUser>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body
    if (!email || !password) {
      next(new AppError('Please provide email and password', 400))
      return
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.correctPassword(password, user.password))) {
      next(new AppError('Incorrect email or password', 401))
      return
    }

    const token = signToken(user._id)
    res.status(200).json({
      status: 'success',
      token,
    })
  }
)

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ').at(1)
    }

    if (!token) {
      next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      )
      return
    }

    const decoded = jwt.verify(token, getEnv('JWT_SECRET')) as JwtPayload

    const user = await User.findById(decoded.id)
    if (!user) {
      next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      )
      return
    }

    if (!decoded.iat) {
      throw new Error('Unexpected error: decoded.iat is undefined')
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      )
      return
    }

    req.user = user
    next()
  }
)

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role
    if (!userRole) {
      throw new Error(
        'Unexpected error: User role is not defined in the request'
      )
    }

    if (!roles.includes(userRole)) {
      next(
        new AppError('You do not have permission to perform this action', 403)
      )
      return
    }

    next()
  }
}

export const forgotPassword = catchAsync(
  async (
    req: Request<Record<string, never>, unknown, IUser>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      next(new AppError('There is no user with that email address', 404))
      return
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // 3) Send it to user's email
    const host = req.get('host')
    if (!host) {
      throw new Error('Unexpected error: Host is not defined')
    }

    const resetUrl = `${req.protocol}://${host}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email!`

    try {
      await sendEmail({
        email: user.email,
        subject: `Your password reset token (valid for ${getEnv('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES')} minutes)`,
        message,
      })
    } catch (error) {
      console.error(error)
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      next(
        new AppError(
          'Unexpected error while sending email. Try again later!',
          500
        )
      )
      return
    }

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    })
  }
)

// export const resetPassword = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {}
