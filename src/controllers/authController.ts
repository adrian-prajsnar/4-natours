import { NextFunction, Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { IUser, User } from '../models/User'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

const signToken = (id: string) => {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined')
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
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
