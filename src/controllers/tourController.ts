import { NextFunction, Request, Response } from 'express'
import { UpdateQuery } from 'mongoose'
import { ITour, Tour, ToursMonthlyPlan, ToursStats } from '../models/tourModel'
import { APIFeatures } from '../utils/apiFeatures'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty'
  next()
}

export const getAllTours = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const features: APIFeatures<ITour> = new APIFeatures<ITour>(
      Tour.find(),
      req.query as Record<string, string>
    )
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const tours: ITour[] = await features.query

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    })
  }
)

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findById(req.params.id).populate('reviews')

    if (!tour) {
      next(new AppError('No tour found with that ID', 404))
      return
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  }
)

export const createTour = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  }
)

export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body as UpdateQuery<ITour>,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!tour) {
      next(new AppError('No tour found with that ID', 404))
      return
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })
  }
)

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if (!tour) {
      next(new AppError('No tour found with that ID', 404))
      return
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  }
)

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
