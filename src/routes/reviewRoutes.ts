import express from 'express'
import { createReview, getAllReviews } from '../controllers/reviewController'
import { protect, restrictTo } from '../controllers/authController'
import { UserRole } from '../utils/enums'

const reviewRouter = express.Router()

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo(UserRole.USER), createReview)

export default reviewRouter
