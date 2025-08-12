import multer from 'multer'
import sharp from 'sharp'
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

const multerStorage = multer.memoryStorage()

const multerFilter = (
  req: Request,
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
export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
])

interface RequestWithFiles extends Request {
  files?:
    | {
        imageCover?: Express.Multer.File[]
        images?: Express.Multer.File[]
      }
    | Express.Multer.File[]
}

export const resizeTourImages = catchAsync(
  async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    const files = req.files as {
      imageCover?: Express.Multer.File[]
      images?: Express.Multer.File[]
    }

    if (!files.imageCover || !files.images) {
      next()
      return
    }

    const body = req.body as { imageCover?: string; images?: string[] }
    body.images = []

    const imageCoverFilename = `tour-${req.params.id}-${Date.now().toString()}-cover.jpeg`
    await sharp(files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`)
    body.imageCover = imageCoverFilename

    await Promise.all(
      (files.images ?? []).map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now().toString()}-${(i + 1).toString()}.jpeg`
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`)
        body.images?.push(filename)
      })
    )

    next()
  }
)

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
