import express, { Router } from 'express';
import {
  checkBody,
  checkId,
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from '../controllers/tourController';

const toursRouter: Router = express.Router();

toursRouter.param('id', checkId);

toursRouter.route('/').get(getAllTours).post(checkBody, createTour);
toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default toursRouter;
