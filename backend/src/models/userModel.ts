import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { model, Schema, Query, Document } from 'mongoose'
import { isEmail } from 'validator'
import { UserRole } from '../utils/enums'
import { getEnv } from '../utils/helpers'

export interface IUser {
  _id: string
  name: string
  email: string
  photo: string
  role: UserRole
  password: string
  passwordConfirm?: string
  passwordChangedAt?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>
  changedPasswordAfter(jwtTimestamp: number): boolean
  createPasswordResetToken(): string
  active: boolean
}

const userSchema = new Schema<IUser>(
  {
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
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
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
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    next()
    return
  }
  this.passwordChangedAt = new Date(Date.now() - 1000)
  next()
})

userSchema.pre(/^find/, function (this: Query<Document<IUser>, IUser>, next) {
  this.find({ active: { $ne: false } })
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

userSchema.methods.createPasswordResetToken = function (this: IUser) {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = new Date(
    Date.now() +
      Number(getEnv('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES')) * 60 * 1000
  )

  return resetToken
}

export const User = model<IUser>('User', userSchema)
