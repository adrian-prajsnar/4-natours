import { NextFunction, Request, Response } from 'express'
import { Tour, ToursMonthlyPlan, ToursStats } from '../models/tourModel'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'
import catchAsync from '../utils/catchAsync'

export const getAllTours = getAll(Tour)
export const getTour = getOne(Tour, { path: 'reviews' })
export const createTour = createOne(Tour)
export const updateTour = updateOne(Tour)
export const deleteTour = deleteOne(Tour)

export const aliasTopTours = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty'
  next()
}

export const getToursStats = catchAsync(async (req: Request, res: Response) => {
  const stats: ToursStats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: `$difficulty` },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  })
})

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response) => {
    const year = Number(req.params.year)
    const plan: ToursMonthlyPlan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year.toString()}-01-01`),
            $lte: new Date(`${year.toString()}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStartsInMonth: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          monthNum: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numToursStartsInMonth: -1,
        },
      },
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    })
  }
)
