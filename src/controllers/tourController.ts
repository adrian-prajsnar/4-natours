import { Request, Response } from 'express'
import { UpdateQuery } from 'mongoose'
import { ITour, Tour } from '../models/Tour'

export async function getAllTours(req: Request, res: Response) {
    try {
        console.log(req.query)

        // BUILD QUERY
        // 1.1) Filtering
        const excludedFields: string[] = ['page', 'sort', 'limit', 'fields']
        const queryObject = Object.fromEntries(
            Object.entries({ ...req.query }).filter(
                ([key]) => !excludedFields.includes(key)
            )
        )

        // 1.2) Advanced Filtering
        const queryString = JSON.stringify(queryObject).replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        )

        const finalQueryObject = JSON.parse(queryString) as Record<
            string,
            unknown
        >

        console.log(finalQueryObject)

        let query = Tour.find(finalQueryObject)

        // 2) Sorting
        if (req.query.sort) {
            // sort ('price ratingsAverage')
            const sortBy: string = (req.query.sort as string)
                .split(',')
                .join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt')
        }

        // EXECUTE QUERY
        const tours = await query

        // SEND RESPONSE
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

export async function getTour(req: Request, res: Response) {
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

export async function createTour(req: Request, res: Response) {
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

export async function updateTour(req: Request, res: Response) {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body as UpdateQuery<ITour>,
            {
                new: true,
                runValidators: true,
            }
        )

        console.log(tour)

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

export async function deleteTour(req: Request, res: Response) {
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
