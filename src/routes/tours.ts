import express, { Router } from 'express'
import {
    createTour,
    deleteTour,
    getAllTours,
    getTour,
    updateTour,
} from '../controllers/tourController'

const toursRouter: Router = express.Router()

toursRouter.route('/').get(getAllTours).post(createTour)
toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default toursRouter
