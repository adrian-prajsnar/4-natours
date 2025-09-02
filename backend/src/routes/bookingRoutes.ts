import express from 'express'
import { protect, restrictTo } from '../controllers/authController'
import { UserRole } from '../utils/enums'
import {
  deleteBooking,
  getAllBookings,
  getBooking,
  getCheckoutSession,
  updateBooking,
} from '../controllers/bookingController'

const bookingsRouter = express.Router()

bookingsRouter.use(protect)
bookingsRouter.get('/checkout-session/:tourId', getCheckoutSession)
bookingsRouter.use(restrictTo(UserRole.ADMIN, UserRole.LEAD_GUIDE))
bookingsRouter.route('/').get(getAllBookings)
bookingsRouter
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking)

export default bookingsRouter
