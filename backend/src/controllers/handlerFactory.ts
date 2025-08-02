import { NextFunction, Request, Response } from 'express'
import { Model, PopulateOptions, UpdateQuery } from 'mongoose'
import { APIFeatures } from '../utils/apiFeatures'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const deleteOne = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      next(new AppError(`No ${Model.modelName} found with that ID`, 404))
      return
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })

export const updateOne = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body as UpdateQuery<T>,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!doc) {
      next(new AppError(`No ${Model.modelName} found with that ID`, 404))
      return
    }

    res.status(200).json({
      status: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    })
  })

export const createOne = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    })
  })

export const getOne = <T>(Model: Model<T>, populateOptions?: PopulateOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = Model.findById(req.params.id)
    if (populateOptions) query.populate(populateOptions)

    const doc = await query
    if (!doc) {
      next(new AppError(`No ${Model.modelName} found with that ID`, 404))
      return
    }

    res.status(200).json({
      status: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc,
      },
    })
  })

export const getAll = <T>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features: APIFeatures<T> = new APIFeatures<T>(
      Model.find(filter),
      req.query as Record<string, string>
    )
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const docs = await features.query

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [Model.modelName.toLowerCase() + 's']: docs,
      },
    })
  })
