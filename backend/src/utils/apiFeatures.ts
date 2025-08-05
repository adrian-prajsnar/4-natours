import { Query } from 'mongoose'

export class APIFeatures<T> {
  query: Query<T[], T>
  queryString: Record<string, string>

  constructor(query: Query<T[], T>, queryString: Record<string, string>) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const excludedFields: string[] = ['page', 'sort', 'limit', 'fields']

    const queryObj: Record<string, string> = Object.fromEntries(
      Object.entries({ ...this.queryString }).filter(
        ([key]) => !excludedFields.includes(key)
      )
    )

    const queryStr: string = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    )

    const finalQueryObj = JSON.parse(queryStr) as Record<string, unknown>

    this.query = this.query.find(finalQueryObj)

    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy: string = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields: string = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }

    return this
  }

  paginate() {
    const page: number = parseInt(this.queryString.page) || 1
    const limit: number = parseInt(this.queryString.limit) || 100
    const skip: number = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}
