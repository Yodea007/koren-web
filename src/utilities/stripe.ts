import Stripe from 'stripe'

// Client Stripe partagé. `null` si la clé n'est pas configurée → les routes
// renvoient une erreur propre au lieu de planter (utile tant que le compte
// Stripe n'est pas créé).
export const stripeSecret = process.env.STRIPE_SECRET_KEY
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

let _stripe: Stripe | null | undefined

export function getStripe(): Stripe | null {
  if (_stripe !== undefined) return _stripe
  _stripe = stripeSecret ? new Stripe(stripeSecret) : null
  return _stripe
}
