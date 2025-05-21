import { Request, Response } from 'express'
import { IUser, User } from '../models/User'
import catchAsync from '../utils/catchAsync'

export const getAllUsers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const users: IUser[] = await User.find()

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    })
  }
)

export function getUser(req: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented yet',
  })
}

export function createUser(req: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented yet',
  })
}

export function updateUser(req: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented yet',
  })
}

export function deleteUser(req: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not implemented yet',
  })
}
