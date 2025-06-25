import express, { Router } from 'express'
import { UserRole } from '../utils/enums'
import { protect, restrictTo } from '../controllers/authController'
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlan,
  getTour,
  getToursStats,
  updateTour,
} from '../controllers/tourController'
import reviewRouter from './reviewRoutes'

const toursRouter: Router = express.Router()

toursRouter.use('/:tourId/reviews', reviewRouter)
toursRouter.route('/stats').get(getToursStats)
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours)
toursRouter
  .route('/monthly-plan/:year')
  .get(
    protect,
    restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE, UserRole.GUIDE),
    getMonthlyPlan
  )
toursRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE), createTour)
toursRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE), updateTour)
  .delete(protect, restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE), deleteTour)

export default toursRouter
