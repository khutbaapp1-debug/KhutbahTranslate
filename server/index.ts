import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ===== STRIPE WEBHOOK: Must be registered BEFORE express.json() =====
// Webhook needs the raw Buffer body, not parsed JSON
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req: any, res: any) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    try {
      const { getStripeClient } = await import("./stripeClient");
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const stripe = getStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: any;
      if (webhookSecret) {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
      } else {
        // In development without webhook secret, parse manually
        event = JSON.parse((req.body as Buffer).toString());
      }

      // Handle subscription events
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.payment_status === "paid") {
          await db.update(users)
            .set({
              subscriptionTier: "premium",
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            })
            .where(eq(users.id, userId));
        }
      }

      if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object;
        if (subscription.status !== "active" && subscription.status !== "trialing") {
          // Find user by stripeSubscriptionId and downgrade
          await db.update(users)
            .set({ subscriptionTier: "free" })
            .where(eq(users.stripeSubscriptionId, subscription.id));
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Stripe webhook error:", error.message);
      res.status(400).json({ error: "Webhook error: " + error.message });
    }
  }
);
// ===== END STRIPE WEBHOOK =====

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function ensureSchemaAndSeed() {
  try {
    const { db } = await import("./db");
    const { sql } = await import("drizzle-orm");

    // Idempotent schema patches for production databases that pre-date the OAuth migration.
    await db.execute(sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS oidc_subject VARCHAR UNIQUE,
        ADD COLUMN IF NOT EXISTS first_name VARCHAR,
        ADD COLUMN IF NOT EXISTS last_name VARCHAR,
        ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);
    // Make legacy username/password optional so OAuth users can be created.
    await db.execute(sql`ALTER TABLE users ALTER COLUMN password DROP NOT NULL;`).catch(() => {});
    await db.execute(sql`ALTER TABLE users ALTER COLUMN username DROP NOT NULL;`).catch(() => {});

    const { duas, hadiths } = await import("@shared/schema");
    const duaCount = await db.select().from(duas).limit(1);
    if (duaCount.length === 0) {
      log("No duas found - seeding database...");
      const { seedDuas } = await import("./seed-duas");
      await seedDuas();
      log("Duas seeded successfully");
    }

    const hadithCount = await db.select().from(hadiths).limit(1);
    if (hadithCount.length === 0) {
      log("No hadiths found - seeding database...");
      const { seedHadiths } = await import("./seed-hadiths");
      await seedHadiths();
      log("Hadiths seeded successfully");
    }
  } catch (err: any) {
    console.error("Startup schema/seed task failed (non-fatal):", err?.message || err);
  }
}

(async () => {
  await ensureSchemaAndSeed();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
