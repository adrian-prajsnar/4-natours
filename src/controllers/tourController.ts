import { NextFunction, Request, Response } from 'express'
import { UpdateQuery } from 'mongoose'
import { APIFeatures } from '../utils/apiFeatures'
import { ITour, Tour, ToursMonthlyPlan, ToursStats } from '../models/Tour'

export function aliasTopTours(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty'
    next()
}

export async function getAllTours(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}

export async function getTour(req: Request, res: Response): Promise<void> {
    try {
        const tour = await Tour.findById(req.params.id)

        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}

export async function createTour(req: Request, res: Response): Promise<void> {
    try {
        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            // DO NOT do it like this in real-world scenario
            // (we will improve it in another section about error handling)
            message: error,
        })
    }
}

export async function updateTour(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}

export async function deleteTour(req: Request, res: Response): Promise<void> {
    try {
        await Tour.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}

export async function getToursStats(req: Request, res: Response) {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}

export async function getMonthlyPlan(req: Request, res: Response) {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        })
    }
}
