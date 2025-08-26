import Stripe from 'stripe'
import { Request, Response } from 'express'
import { Tour } from '../models/tourModel'
import { getEnv } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'

const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'))

interface GetCheckoutSessionReq extends Request {
  user?: {
    email: string
  }
}

const hasUser = (
  req: GetCheckoutSessionReq
): req is GetCheckoutSessionReq & { user: { email: string } } => {
  return req.user !== undefined
}

export const getCheckoutSession = catchAsync(
  async (req: GetCheckoutSessionReq, res: Response) => {
    // 1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    if (!tour) {
      throw new Error('Unexpected error: Tour is not defined')
    }

    const host = req.get('host')
    if (!host) {
      throw new Error('Unexpected error: Host is not defined')
    }

    const tourSlug = tour.slug
    if (!tourSlug) {
      throw new Error('Unexpected error: Tour slug is not defined')
    }

    // Check if user exists
    if (!hasUser(req)) {
      throw new Error('Unexpected error: User must be logged in to book a tour')
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${host}`,
      cancel_url: `${req.protocol}://${host}/tour/${tourSlug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100, // convert to cents
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // temporarily
            },
          },
          quantity: 1,
        },
      ],
    })

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    })
  }
)
