import express, { Router } from 'express'
import {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
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
import { UserRole } from '../utils/enums'

const usersRouter: Router = express.Router()

usersRouter.post('/signup', signUp)
usersRouter.post('/login', login)
usersRouter.get('/logout', logout)
usersRouter.post('/forgotPassword', forgotPassword)
usersRouter.patch('/resetPassword/:token', resetPassword)

// Protect all routes after this middleware
usersRouter.use(protect)

usersRouter.get('/me', getMe, getUser)
usersRouter.patch('/updateMe', updateMe)
usersRouter.delete('/deleteMe', deleteMe)
usersRouter.patch('/updateMyPassword', updatePassword)

// Restrict all routes after this middleware to ADMIN
usersRouter.use(restrictTo(UserRole.ADMIN))

usersRouter.route('/').get(getAllUsers).post(createUser)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default usersRouter
