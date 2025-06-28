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
import AppError from '../utils/appError'

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

export const getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',').map(Number)

    if (!lat || !lng || !distance || !unit) {
      next(
        new AppError(
          'Please provide latitude, longitude, distance and unit in format /tours-within/:distance/center/:lat,lng/unit/:unit',
          400
        )
      )
    }

    const radius =
      unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    })

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    })
  }
)

export const getDistances = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',').map(Number)

    if (!lat || !lng || !unit) {
      next(
        new AppError(
          'Please provide latitude, longitude and unit in format /distances/:lat,lng/unit/:unit',
          400
        )
      )
    }

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          includeLocs: 'startLocation',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ])

    res.status(200).json({
      status: 'success',
      data: {
        distances,
      },
    })
  }
)
