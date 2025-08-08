import { NextFunction, Request, Response } from 'express'
import { User, IUser } from '../models/userModel'

interface CustomRequest extends Request {
  user?: IUser
}
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

export const getAllUsers = getAll(User)
export const getUser = getOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)

const filterObj = <T extends Record<string, unknown>>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> => {
  const newObj: Partial<T> = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el as keyof T)) {
      newObj[el as keyof T] = obj[el as keyof T]
    }
  })
  return newObj
}

export const getMe = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user?._id) {
    next(new AppError('User not found', 404))
    return
  }
  req.params.id = req.user._id
  next()
}

export const updateMe = catchAsync(
  async (
    req: CustomRequest & {
      body: {
        password?: string
        passwordConfirm?: string
        name?: string
        email?: string
      }
    },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const typedBody = req.body as {
      password?: string
      passwordConfirm?: string
      name?: string
      email?: string
    }

    if (typedBody.password || typedBody.passwordConfirm) {
      next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword route',
          400
        )
      )
      return
    }

    if (!req.user?._id) {
      next(new AppError('User not found', 404))
      return
    }

    const filteredBody = filterObj(typedBody, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
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

export const deleteMe = catchAsync(
  async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user?._id) {
      next(new AppError('User not found', 404))
      return
    }
    await User.findByIdAndUpdate(req.user._id, { active: false })

    res.status(204).json({
      status: 'success',
      data: null,
    })
  }
)

export function createUser(req: Request, res: Response) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  })
}
