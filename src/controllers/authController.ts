import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { IUser, User } from '../models/User'
import { getEnv } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

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
      passwordChangedAt: req.body.passwordChangedAt,
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
