import slugify from 'slugify'
import { model, Query, Schema, Types } from 'mongoose'
import { IUser } from './userModel'
import { StartLocationType, TourDifficulty } from '../utils/enums'
import { IReview } from './reviewModel'

export interface ITour {
  _id: Types.ObjectId
  name: string
  slug?: string
  duration: number
  maxGroupSize: number
  difficulty: TourDifficulty
  ratingsAverage?: number
  ratingsQuantity?: number
  price: number
  priceDiscount?: number
  summary: string
  description?: string
  imageCover: string
  images?: string[]
  createdAt: Date
  startDates: Date[]
  secretTour: boolean
  startLocation: ILocation
  locations: ILocation[]
  guides: IUser[]
  reviews?: IReview[]
}

interface ILocation {
  type: StartLocationType
  coordinates: number[]
  address?: string
  description?: string
  day?: number
}

interface ITourStat {
  _id: keyof typeof TourDifficulty
  numTours: number
  numRatings: number
  avgRating: number
  avgPrice: number
  minPrice: number
  maxPrice: number
}

export type ToursStats = ITourStat[]

interface IToursInMonth {
  monthNum: number
  numToursStartsInMonth: number
  tours: string[]
}

export type ToursMonthlyPlan = IToursInMonth[]

const tourSchema = new Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: Object.values(TourDifficulty),
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number) {
          // this only points to current doc on NEW document creation
          return val < this.price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: StartLocationType.POINT,
        enum: Object.values(StartLocationType),
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: {
        type: Number,
        default: 1,
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: StartLocationType.POINT,
          enum: Object.values(StartLocationType),
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

tourSchema.index({ price: 1, ratingsAverage: -1 })

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
})

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

tourSchema.pre(
  /^find/,
  function (this: Query<unknown, unknown> & { start: number }, next) {
    this.find({
      secretTour: { $ne: true },
    })
    this.start = Date.now()
    next()
  }
)

tourSchema.post(
  /^find/,
  function (this: Query<unknown, unknown> & { start: number }, docs, next) {
    console.log(
      `Query took ${(Date.now() - this.start).toString()} milliseconds!`
    )
    next()
  }
)

tourSchema.pre(/^find/, function (this: Query<ITour, ITour>, next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })
  next()
})

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  })
  next()
})

export const Tour = model<ITour>('Tour', tourSchema)
