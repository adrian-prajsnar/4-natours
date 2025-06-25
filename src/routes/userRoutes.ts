import express, { Router } from 'express'
import {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} from '../controllers/authController'
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  updateMe,
  updateUser,
} from '../controllers/userController'

const usersRouter: Router = express.Router()

usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)
usersRouter.post('/forgotPassword', forgotPassword)
usersRouter.patch('/resetPassword/:token', resetPassword)
usersRouter.get('/me', protect, getMe, getUser)
usersRouter.patch('/updateMe', protect, updateMe)
usersRouter.delete('/deleteMe', protect, deleteMe)
usersRouter.patch('/updateMyPassword', protect, updatePassword)
usersRouter.route('/').get(getAllUsers).post(createUser)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default usersRouter
