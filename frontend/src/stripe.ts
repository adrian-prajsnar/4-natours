import axios, { isAxiosError } from 'axios'
import { showAlert } from './alerts'
import { loadStripe } from '@stripe/stripe-js'

const PROJECT_URL = document.querySelector('main')?.dataset.projectUrl ?? '-'

interface CheckoutSessionResponse {
  session: { id: string }
}

interface RedirectOptions {
  sessionId: string
}

interface StripeLike {
  redirectToCheckout(
    options: RedirectOptions
  ): Promise<{ error?: unknown } | undefined>
}

export const bookTour = async (tourId: string): Promise<void> => {
  try {
    // 1) Initialize Stripe
    const loadStripeFn = loadStripe as unknown as (
      pk: string
    ) => Promise<unknown>
    const stripe: unknown = await loadStripeFn(
      'pk_test_51Rxp1oAcnCNcHnCJGU4sKlTWxbdTkI3JI1jeApqiHkiuLRIUB831Ki0es9yzxxO3OA0Mj74OcyAj6LnfDBCyboon00RPNb8vFR'
    )
    if (!stripe) {
      showAlert('error', 'Payment system unavailable. Please try again later.')
      return
    }

    const hasRedirect = (obj: unknown): obj is StripeLike =>
      !!obj &&
      typeof (obj as { redirectToCheckout?: unknown }).redirectToCheckout ===
        'function'
    if (!hasRedirect(stripe)) {
      showAlert('error', 'Payment system unavailable. Please try again later.')
      return
    }
    const stripeInstance: StripeLike = stripe

    // 2) Get checkout session from API
    const session = await axios.get<CheckoutSessionResponse>(
      `${PROJECT_URL}/api/v1/bookings/checkout-session/${tourId}`
    )
    console.log('session: ', session)

    // 3) Automatically create checkout form + charge credit card
    await stripeInstance.redirectToCheckout({
      sessionId: session.data.session.id,
    })
  } catch (err: unknown) {
    console.error(err)
    let message = 'Something went wrong while starting checkout.'
    if (isAxiosError(err)) {
      message =
        (err.response?.data as { message?: string } | undefined)?.message ??
        err.message
    } else if (err instanceof Error) {
      message = err.message
    }
    showAlert('error', message)
  }
}
