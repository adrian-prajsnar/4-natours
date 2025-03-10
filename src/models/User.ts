import validator from 'validator'
import { model, Schema, Types } from 'mongoose'

export interface IUser {
  _id: Types.ObjectId
  name: string
  email: string
  photo: string
  password: string
  passwordConfirm: string
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password must have at least 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please repeat your password'],
  },
})

export const User = model<IUser>('User', userSchema)
