import { NextFunction, Request, Response } from 'express'
import { Tour } from '../models/tourModel'
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
