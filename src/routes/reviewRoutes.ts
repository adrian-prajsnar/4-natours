import express from 'express'
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview,
} from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'
import { UserRole } from '../utils/enums'

const reviewsRouter = express.Router({ mergeParams: true })

reviewsRouter.use(protect)

reviewsRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo(UserRole.USER), setTourUserIds, createReview)
reviewsRouter
  .route('/:id')
  .get(getReview)
  .delete(restrictTo(UserRole.USER, UserRole.ADMIN), deleteReview)
  .patch(restrictTo(UserRole.USER, UserRole.ADMIN), updateReview)

export default reviewsRouter
