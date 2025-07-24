import express from 'express'
import { getOverview, getTour } from '../controllers/viewController'

const viewsRouter = express.Router()

viewsRouter.get('/', getOverview)
viewsRouter.get('/tour', getTour)

export default viewsRouter
