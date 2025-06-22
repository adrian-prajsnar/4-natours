import { Request, Response } from 'express'
import { Review } from '../models/reviewModel'
import catchAsync from '../utils/catchAsync'

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await Review.find()
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  })
})

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const newReview = await Review.create(req.body)
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  })
})
