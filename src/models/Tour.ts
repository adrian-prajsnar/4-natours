import slugify from 'slugify'
import { model, Query, Schema, Types } from 'mongoose'

export interface ITour {
    _id: Types.ObjectId
    name: string
    slug?: string
    duration: number
    maxGroupSize: number
    difficulty: 'easy' | 'medium' | 'difficult'
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
    isSecretTour: boolean
}

const tourSchema = new Schema<ITour>(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
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
            enum: ['easy', 'medium', 'difficult'],
            required: [true, 'A tour must have a difficulty'],
        },
        ratingsAverage: {
            type: Number,
            default: 5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: Number,
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
        isSecretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

tourSchema.pre(
    /^find/,
    function (this: Query<unknown, unknown> & { start: number }, next) {
        this.find({
            isSecretTour: { $ne: true },
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

export const Tour = model<ITour>('Tour', tourSchema)

export type ToursStats = TourStat[]

interface TourStat {
    _id: 'MEDIUM' | 'EASY' | 'DIFFICULT'
    numTours: number
    numRatings: number
    avgRating: number
    avgPrice: number
    minPrice: number
    maxPrice: number
}

export type ToursMonthlyPlan = ToursInMonth[]

interface ToursInMonth {
    monthNum: number
    numToursStartsInMonth: number
    tours: string[]
}
