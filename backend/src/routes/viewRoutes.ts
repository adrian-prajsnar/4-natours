import express from 'express'
import { isLoggedIn, protect } from '../controllers/authController'
import {
  getAccount,
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.get('/', isLoggedIn, getOverview)
viewsRouter.get('/tours/:slug', isLoggedIn, getTour)
viewsRouter.get('/login', isLoggedIn, getLoginForm)
viewsRouter.get('/me', protect, getAccount)

export default viewsRouter
