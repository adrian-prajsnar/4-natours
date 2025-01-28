import { model, Schema, Types } from 'mongoose'

export interface ITour {
    _id: Types.ObjectId
    name: string
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
}

const tourSchema = new Schema<ITour>({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
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
})

export const Tour = model<ITour>('Tour', tourSchema)

export type ToursStats = {
    _id: 'MEDIUM' | 'EASY' | 'DIFFICULT'
    numTours: number
    numRatings: number
    avgRating: number
    avgPrice: number
    minPrice: number
    maxPrice: number
}[]

export type ToursMonthlyPlan = {
    numToursStartsInMonth: number
    tours: string[]
    monthNum: number
}[]
