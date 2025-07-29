import crypto from 'crypto'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { IUser, User } from '../models/userModel'
import { UserRole } from '../utils/enums'
import { getEnv } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import sendEmail from '../utils/email'

const signToken = (id: string) => {
  return jwt.sign({ id }, getEnv('JWT_SECRET'), {
    expiresIn: getEnv('JWT_EXPIRES_IN'),
  } as SignOptions)
}

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(getEnv('JWT_COOKIE_EXPIRES_IN')) * 24 * 60 * 60 * 1000
    ),
    secure: getEnv('NODE_ENV') === 'production',
    httpOnly: true,
  }
  user.password = undefined as unknown as string
  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

export const signUp = catchAsync(
  async (
    req: Request<
      Record<string, never>,
      unknown,
      {
        name: string
        email: string
        password: string
        passwordConfirm: string
      }
    >,
    res: Response
  ): Promise<void> => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    })

    createSendToken(newUser, 201, res)
  }
)

export const login = catchAsync(
  async (
    req: Request<
      Record<string, never>,
      unknown,
      {
        email: string
        password: string
      }
    >,
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

    createSendToken(user, 200, res)
  }
)

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ').at(1)
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt as string
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
    req: Request<
      Record<string, never>,
      unknown,
      {
        email: string
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      next(new AppError('There is no user with that email address', 404))
      return
    }

    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

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

export const resetPassword = catchAsync(
  async (
    req: Request<
      { token: string },
      unknown,
      {
        password: string
        passwordConfirm: string
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      next(new AppError('Token is invalid or has expired', 400))
      return
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Update changedPasswordAt using userSchema.pre save method

    createSendToken(user, 200, res)
  }
)

export const updatePassword = catchAsync(
  async (
    req: Request<
      Record<string, never>,
      unknown,
      {
        currentPassword: string
        newPassword: string
        newPasswordConfirm: string
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = await User.findById(req.user?._id).select('+password')
    if (!user) {
      next(new AppError('User not found', 404))
      return
    }

    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      next(new AppError('Your current password is incorrect', 401))
      return
    }
    if (req.body.newPassword !== req.body.newPasswordConfirm) {
      next(
        new AppError(
          'New password and new password confirm are not the same',
          400
        )
      )
      return
    }

    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()

    createSendToken(user, 200, res)
  }
)
