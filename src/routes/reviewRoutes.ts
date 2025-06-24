import express from 'express'
import {
  createReview,
  deleteReview,
  getAllReviews,
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'
import { UserRole } from '../utils/enums'

const reviewRouter = express.Router({
  mergeParams: true,
})

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo(UserRole.USER), createReview)
reviewRouter.route('/:id').delete(deleteReview)

export default reviewRouter
