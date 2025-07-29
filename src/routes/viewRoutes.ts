import express from 'express'
import {
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController'
import { protect } from '../controllers/authController'

const viewsRouter = express.Router()

viewsRouter.get('/', getOverview)
viewsRouter.get('/tours/:slug', protect, getTour)
viewsRouter.get('/login', getLoginForm)

export default viewsRouter
