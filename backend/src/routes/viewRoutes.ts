import express from 'express'
import { isLoggedIn, protect } from '../controllers/authController'
// import { createBookingCheckout } from '../controllers/bookingController'
import {
  getAccount,
  getLoginForm,
  getMyTours,
  getOverview,
  getTour,
  updateUserData,
} from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.get('/', isLoggedIn, getOverview)
viewsRouter.get('/tours/:slug', isLoggedIn, getTour)
viewsRouter.get('/login', isLoggedIn, getLoginForm)
viewsRouter.get('/me', protect, getAccount)
viewsRouter.get(
  '/my-tours',
  // createBookingCheckout,
  protect,
  getMyTours
)
viewsRouter.post('/submit-user-data', protect, updateUserData)

export default viewsRouter
