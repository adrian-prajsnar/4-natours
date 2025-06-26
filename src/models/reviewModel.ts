import { model, Query, Schema, Types, Model } from 'mongoose'
import { ITour, Tour } from './tourModel'
import { IUser } from './userModel'

export interface IReview {
  _id: Types.ObjectId
  review: string
  rating: number
  createdAt: Date
  tour: ITour
  user: IUser
}

interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: string): Promise<void>
}

const reviewSchema = new Schema<IReview, IReviewModel>(
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

reviewSchema.pre(/^find/, function (this: Query<IReview, IReview>, next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId: string) {
  interface IStats {
    _id: string
    numRatings: number
    avgRating: number
  }

  const stats: IStats[] = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].numRatings,
    ratingsAverage: stats[0].avgRating,
  })
}

reviewSchema.post('save', async function () {
  await (this.constructor as IReviewModel).calcAverageRatings(
    this.tour as unknown as string
  )
})

export const Review = model<IReview, IReviewModel>('Review', reviewSchema)
