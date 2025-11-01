import Stripe from 'stripe'
import { Request, Response } from 'express'
import { Tour } from '../models/tourModel'
import { Booking } from '../models/bookingModel'
import { getEnv } from '../utils/helpers'
import catchAsync from '../utils/catchAsync'
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory'
import { User } from '../models/userModel'

const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'))

interface GetCheckoutSessionReq extends Request {
  user?: {
    id: string
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
      // success_url: `${req.protocol}://${host}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price.toString()}`,
      success_url: `${req.protocol}://${host}/my-tours`,
      cancel_url: `${req.protocol}://${host}/tours/${tourSlug}`,
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

// export const createBookingCheckout = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//     const { tour, user, price } = req.query
//     if (!tour && !user && !price) {
//       next()
//       return
//     }

//     await Booking.create({ tour, user, price })
//     res.redirect(req.originalUrl.split('?')[0])
//   }
// )

const createBookingCheckout = async (session: Stripe.Checkout.Session) => {
  const tour = session.client_reference_id
  const user = (await User.findOne({ email: session.customer_email }))
    ?.id as string
  const price = session.amount_total ? session.amount_total / 100 : 0
  await Booking.create({ tour, user, price })
}

export const webhookCheckout = (req: Request, res: Response) => {
  const signature = req.headers['strict-signature'] as string
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body as string,
      signature,
      getEnv('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).send(`Webhook error: ${err.message}`)
      return
    }
    res.status(400).send('Webhook error: Unknown error')
    return
  }

  if (event.type === 'checkout.session.completed') {
    void createBookingCheckout(event.data.object)
  }

  res.status(200).json({ received: true })
}

export const getAllBookings = getAll(Booking)
export const getBooking = getOne(Booking)
export const createBooking = createOne(Booking)
export const updateBooking = updateOne(Booking)
export const deleteBooking = deleteOne(Booking)
