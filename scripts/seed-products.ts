/**
 * Seed Stripe products for Khutbah Companion.
 * Run with: npx tsx scripts/seed-products.ts
 *
 * This script is idempotent — it checks before creating.
 */
import Stripe from 'stripe';

async function createProducts() {
  const secretKey = process.env.TESTING_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('TESTING_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY environment variable is required');
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-01-27.acacia' });

  console.log('Checking for existing Khutbah Companion Premium product...');

  const existing = await stripe.products.search({
    query: "name:'Khutbah Companion Premium' AND active:'true'",
  });

  if (existing.data.length > 0) {
    console.log('Product already exists:', existing.data[0].id);
    const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
    console.log('Existing prices:');
    prices.data.forEach(p => {
      console.log(`  - ${p.id}: $${(p.unit_amount! / 100).toFixed(2)}/${(p.recurring?.interval || 'one-time')}`);
    });
    return;
  }

  console.log('Creating product...');
  const product = await stripe.products.create({
    name: 'Khutbah Companion Premium',
    description: 'Unlimited AI features, khutbah database, analytics dashboard, and more.',
  });
  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 499, // $4.99
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  console.log(`Created monthly price: $4.99/month (${price.id})`);
  console.log('Done! Stripe product and price created successfully.');
}

createProducts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
