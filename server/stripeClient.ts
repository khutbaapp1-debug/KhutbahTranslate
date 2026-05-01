import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.TESTING_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Stripe secret key not found. Set TESTING_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY.');
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripeClient;
}
