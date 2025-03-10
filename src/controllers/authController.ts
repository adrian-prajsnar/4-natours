import { Request, Response } from 'express'
import { User } from '../models/User'
import catchAsync from '../utils/catchAsync'

export const signUp = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const newUser = await User.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    })
  }
)
