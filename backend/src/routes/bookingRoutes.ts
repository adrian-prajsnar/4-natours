import express from 'express'
import { protect } from '../controllers/authController'
import { getCheckoutSession } from '../controllers/bookingController'

const bookingsRouter = express.Router()

bookingsRouter.get('/checkout-session/:tourId', protect, getCheckoutSession)

export default bookingsRouter
