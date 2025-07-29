import express from 'express'
import {
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.get('/', getOverview)
viewsRouter.get('/tours/:slug', getTour)
viewsRouter.get('/login', getLoginForm)

export default viewsRouter
