import { Request, Response } from 'express'
import { Tour } from '../models/tourModel'
import catchAsync from '../utils/catchAsync'

export const getOverview = catchAsync(async (_req: Request, res: Response) => {
  // 1) Get tour data from collection
  const tours = await Tour.find()

  // 2) Build template

  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', { title: 'All Tours', tours })
})

export const getTour = (_req: Request, res: Response) => {
  res.status(200).render('tour', { title: 'The Forest Hiker Tour' })
}
