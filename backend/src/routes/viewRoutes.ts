import express from 'express'
import { isLoggedIn } from '../controllers/authController'
import {
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.use(isLoggedIn)
viewsRouter.get('/', getOverview)
viewsRouter.get('/tours/:slug', getTour)
viewsRouter.get('/login', getLoginForm)

export default viewsRouter
