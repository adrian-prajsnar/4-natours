import { model, Schema, Types } from 'mongoose'
import { ITour } from './tourModel'
import { IUser } from './userModel'

export interface IReview {
  _id: Types.ObjectId
  review: string
  rating: number
  createdAt: Date
  tour: ITour
  user: IUser
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export const Review = model<IReview>('Review', reviewSchema)
