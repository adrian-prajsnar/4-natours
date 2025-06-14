import { NextFunction, Request, Response } from 'express'
import { IUser, User } from '../models/userModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

const filterObj = (
  obj: Record<string, unknown>,
  ...allowedFields: string[]
) => {
  const newObj: Record<string, unknown> = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

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

export const updateMe = catchAsync(
  async (
    req: Request<
      unknown,
      unknown,
      {
        password: string
        passwordConfirm: string
        name: string
        email: string
      }
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (req.body.password || req.body.passwordConfirm) {
      next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword route',
          400
        )
      )
      return
    }

    const filteredBody = filterObj(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
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
