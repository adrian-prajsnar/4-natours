import express from 'express'
import { getOverview, getTour } from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.get('/', getOverview)
viewsRouter.get('/tours/:slug', getTour)

export default viewsRouter
