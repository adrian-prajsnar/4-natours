import express, { Router } from 'express'
import {
    aliasTopTours,
    createTour,
    deleteTour,
    getAllTours,
    getTour,
    getTourStats,
    updateTour,
} from '../controllers/tourController'

const toursRouter: Router = express.Router()

toursRouter.route('/tour-stats').get(getTourStats)
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours)
toursRouter.route('/').get(getAllTours).post(createTour)
toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default toursRouter
