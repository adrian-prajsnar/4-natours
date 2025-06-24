import { NextFunction, Request, Response } from 'express'
import { Model, UpdateQuery } from 'mongoose'
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
