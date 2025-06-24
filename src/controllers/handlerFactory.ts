import { NextFunction, Request, Response } from 'express'
import { Model } from 'mongoose'
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
