export type TourSimple = {
    id: number
    name: string
    duration: number
    maxGroupSize: number
    difficulty: 'easy' | 'medium' | 'difficult'
    ratingsAverage: number
    ratingsQuantity: number
    price: number
    summary: string
    description: string
    imageCover: string
    images: string[]
    startDates: string[]
}
