import { NextFunction, Request, Response } from 'express'
import { Tour } from '../models/tourModel'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import { UserRole } from '../utils/enums'

export const getOverview = catchAsync(async (_req: Request, res: Response) => {
  const tours = await Tour.find()
  res.status(200).render('overview', { title: 'All Tours', tours })
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
      next(new AppError(`No tour found with that slug`, 404))
      return
    }

    res.status(200).render('tour', { title: `${tour.name} Tour`, tour, roles })
  }
)
