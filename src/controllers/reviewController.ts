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

interface CreateReviewRequest extends Request {
  params: {
    tourId?: string
  }
  body: {
    tour?: string
    user?: string
  }
}

export const createReview = catchAsync(
  async (req: CreateReviewRequest, res: Response) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user?._id

    const newReview = await Review.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    })
  }
)
