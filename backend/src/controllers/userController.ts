import multer from 'multer'
import sharp from 'sharp'
import { NextFunction, Request, Response } from 'express'
import { User, IUser } from '../models/userModel'
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

interface CustomRequest extends Request {
  user?: IUser
}

const multerStorage = multer.memoryStorage()

const multerFilter = (
  req: CustomRequest,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images', 400))
  }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })
export const uploadUserPhoto = upload.single('photo')

export const resizeUserPhoto = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      next()
      return
    }

    const userId = req.user?._id
    if (!userId) {
      new AppError('Unexpected error: user not found', 404)
      return
    }
    req.file.filename = `user-${userId}-${Date.now().toString()}.jpeg`

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({
        quality: 90,
      })
      .toFile(`public/img/users/${req.file.filename}`)

    next()
  }
)

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
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const body = req.body as {
      password?: string
      passwordConfirm?: string
      name?: string
      email?: string
      photo?: string
    }

    if (body.password || body.passwordConfirm) {
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

    const filteredBody = filterObj(body, 'name', 'email')
    if (req.file) {
      filteredBody.photo = req.file.filename
    }
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
