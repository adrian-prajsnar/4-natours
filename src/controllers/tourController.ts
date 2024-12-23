import fs from 'fs'
import { TourSimple } from '../types/TourSimple'
import { NextFunction, Request, Response } from 'express'

const tours: TourSimple[] = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../../dev-data/data/tours-simple.json`,
        'utf-8'
    )
) as TourSimple[]

export function checkId(
    req: Request,
    res: Response,
    next: NextFunction,
    val: string
) {
    console.log(`Tour ID is: ${val}`)
    const id = Number(req.params.id)

    if (id > tours.length)
        return res.status(404).json({
            status: 'fail',
            message: `Tour with id: ${req.params.id} not found`,
        })

    next()
}

type TourRequestBody = {
    name: string
    price: string
}

export function checkBody(req: Request, res: Response, next: NextFunction) {
    const { name, price } = req.body as TourRequestBody

    if (!name || !price)
        res.status(400).json({
            status: 'fail',
            message: 'Missing name or price',
        })
    else next()
}

export function getAllTours(req: Request, res: Response) {
    console.log(req.requestTime)

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours: tours,
        },
    })
}

export function getTour(req: Request, res: Response) {
    const id = Number(req.params.id)
    const tour: TourSimple | undefined = tours.find(
        (tour: TourSimple) => tour.id === id
    )

    if (!tour)
        res.status(404).json({
            status: 'fail',
            message: `Tour with id: ${req.params.id} not found`,
        })
    else
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour,
            },
        })
}

export function createTour(req: Request, res: Response) {
    const newId: number = tours[tours.length - 1].id + 1
    const newTour: TourSimple = Object.assign(
        { id: newId },
        req.body
    ) as TourSimple

    tours.push(newTour)

    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        () => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            })
        }
    )
}

export function updateTour(req: Request, res: Response) {
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<There should be the updated tour>',
        },
    })
}

export function deleteTour(req: Request, res: Response) {
    res.status(204).json({
        status: 'success',
        data: null,
    })
}
