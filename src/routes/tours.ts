import express, { Router } from 'express'
import {
    aliasTopTours,
    createTour,
    deleteTour,
    getAllTours,
    getMonthlyPlan,
    getTour,
    getToursStats,
    updateTour,
} from '../controllers/tourController'

const toursRouter: Router = express.Router()

toursRouter.route('/tour-stats').get(getToursStats)
toursRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours)
toursRouter.route('/monthly-plan/:year').get(getMonthlyPlan)
toursRouter.route('/').get(getAllTours).post(createTour)
toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

export default toursRouter
