import { NextFunction, Request, Response } from 'express'
import { UpdateQuery } from 'mongoose'
import { ITour, Tour, ToursMonthlyPlan, ToursStats } from '../models/Tour'
import { APIFeatures } from '../utils/apiFeatures'
import catchAsync from '../utils/catchAsync'

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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    next()
  }
)

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })

    next()
  }
)

export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })

    next()
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

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    })

    next()
  }
)

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: 'success',
      data: null,
    })

    next()
  }
)

export const getToursStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

    next()
  }
)

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

    next()
  }
)
