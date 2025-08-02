import { NextFunction, Request, Response } from 'express'
import { Review } from '../models/reviewModel'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'

export const getAllReviews = getAll(Review)
export const getReview = getOne(Review)
export const createReview = createOne(Review)
export const deleteReview = deleteOne(Review)
export const updateReview = updateOne(Review)

interface CreateReviewRequest extends Request {
  params: {
    tourId?: string
  }
  body: {
    tour?: string
    user?: string
  }
}

export const setTourUserIds = (
  req: CreateReviewRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user?._id
  next()
}
