import express, { Router } from 'express'
import { login, signUp } from '../controllers/authController'
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController'

const usersRouter: Router = express.Router()

usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)
usersRouter.route('/').get(getAllUsers).post(createUser)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default usersRouter
