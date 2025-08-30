import { NextFunction, Request, Response } from 'express'
import { Tour } from '../models/tourModel'
import { IUser, User } from '../models/userModel'
import { Booking } from '../models/bookingModel'
import { UserRole } from '../utils/enums'
import { PROJECT_URL } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

export const getOverview = catchAsync(async (_req: Request, res: Response) => {
  const tours = await Tour.find()
  res.status(200).render('overview', { title: 'All Tours', tours, PROJECT_URL })
})

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const roles = UserRole
    const tour = await Tour.findOne({
      slug: req.params.slug,
    }).populate({
      path: 'reviews',
      select: 'review rating user',
    })

    if (!tour) {
      next(new AppError(`There is no tour with that name.`, 404))
      return
    }

    res
      .status(200)
      .render('tour', { title: `${tour.name} Tour`, tour, roles, PROJECT_URL })
  }
)

export const getLoginForm = (_req: Request, res: Response) => {
  res.status(200).render('login', {
    title: 'Log into your account',
    PROJECT_URL,
  })
}

export const getAccount = (req: Request, res: Response) => {
  res.status(200).render('account', {
    title: 'Your account',
    PROJECT_URL,
  })
}

interface GetMyToursReq extends Request {
  user?: {
    _id: string
  }
}

export const getMyTours = catchAsync(
  async (req: GetMyToursReq, res: Response) => {
    // 1) Find all bookings
    if (!req.user) throw new Error('Unexpected error: there is no user.')
    const bookings = await Booking.find({
      user: req.user._id,
    })

    // 2) Find yours with the returned IDs
    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({
      _id: { $in: tourIds },
    })

    res
      .status(200)
      .render('overview', { title: 'My Tours', tours, PROJECT_URL })
  }
)

interface UpdateUserDataRequest extends Request {
  user?: IUser
  body: { name?: string; email?: string }
}

export const updateUserData = catchAsync(
  async (req: UpdateUserDataRequest, res: Response) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      { name: req.body.name, email: req.body.email },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedUser) {
      throw new AppError('No user found with that ID', 404)
    }

    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser,
      PROJECT_URL,
    })
  }
)
