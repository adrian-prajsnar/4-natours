import { Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { IUser, User } from '../models/User'
import catchAsync from '../utils/catchAsync'

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

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined')
    }

    const token = jwt.sign({ id: newUser._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
    } as SignOptions)

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    })
  }
)
