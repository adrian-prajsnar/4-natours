import express from 'express'
import {
  createReview,
  deleteReview,
  getAllReviews,
  setTourUserIds,
  updateReview,
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'
import { UserRole } from '../utils/enums'

const reviewRouter = express.Router({
  mergeParams: true,
})

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo(UserRole.USER), setTourUserIds, createReview)
reviewRouter.route('/:id').delete(deleteReview).patch(updateReview)

export default reviewRouter
