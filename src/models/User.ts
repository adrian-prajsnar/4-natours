import { isEmail } from 'validator'
import { model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id: string
  name: string
  email: string
  photo: string
  password: string
  passwordConfirm?: string
  passwordChangedAt?: Date
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>
  changedPasswordAfter(jwtTimestamp: number): boolean
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
    validate: [isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password must have at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please repeat your password'],
    validate: {
      // This only works on CREATE and SAVE!!! not on UPDATE!!!
      validator: function (this: IUser, el: string) {
        return el === this.password
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (
  this: IUser,
  jwtTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000
    return jwtTimestamp < changedTimestamp
  }

  return false
}

export const User = model<IUser>('User', userSchema)
