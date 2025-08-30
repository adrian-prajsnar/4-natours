import mongoose, { model, Query } from 'mongoose'
import { ITour } from './tourModel'
import { IUser } from './userModel'

interface IBooking {
  _id: string
  tour: ITour
  user: IUser
  price: number
  createdAt: Date
  paid: boolean
}

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
})

bookingSchema.pre(/^find/, function (this: Query<IBooking, IBooking>, next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  })
  next()
})

export const Booking = model<IBooking>('Booking', bookingSchema)
