import { NextFunction, Request, Response } from 'express'
import { Review } from '../models/reviewModel'
import { createOne, deleteOne, updateOne } from './handlerFactory'
import catchAsync from '../utils/catchAsync'

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  let filter = {}
  if (req.params.tourId) filter = { tour: req.params.tourId }

  const reviews = await Review.find(filter)
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  })
})

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

export const createReview = createOne(Review)
export const deleteReview = deleteOne(Review)
export const updateReview = updateOne(Review)
