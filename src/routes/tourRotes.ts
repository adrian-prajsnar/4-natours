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

const toursRouter: Router = express.Router()

toursRouter.route('/stats').get(getToursStats)
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours)
toursRouter.route('/monthly-plan/:year').get(getMonthlyPlan)
toursRouter.route('/').get(protect, getAllTours).post(createTour)
toursRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE), deleteTour)

export default toursRouter
