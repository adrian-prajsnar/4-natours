import { NextFunction, Request, Response } from 'express'
import { UpdateQuery } from 'mongoose'
import { APIFeatures } from '../utils/apiFeatures'
import { ITour, Tour } from '../models/Tour'

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
