// Translation usage tracking and limits for free tier users
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const FREE_TIER_MONTHLY_LIMIT_MINUTES = 120; // 2 hours per month

export interface UsageInfo {
  minutesUsed: number;
  minutesRemaining: number;
  monthlyLimit: number;
  resetDate: Date;
  isLimitReached: boolean;
}

// Check if user's monthly usage needs to be reset
export async function checkAndResetMonthlyUsage(userId: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) return;
  
  const now = new Date();
  const resetDate = new Date(user.translationUsageResetDate);
  
  // Reset if a month has passed
  if (now > resetDate) {
    const nextResetDate = new Date(resetDate);
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    
    await db.update(users)
      .set({
        monthlyTranslationMinutesUsed: 0,
        translationUsageResetDate: nextResetDate,
      })
      .where(eq(users.id, userId));
  }
}

// Get user's current usage info
export async function getUserUsageInfo(userId: string): Promise<UsageInfo> {
  await checkAndResetMonthlyUsage(userId);
  
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Premium users have unlimited usage
  if (user.subscriptionTier === "premium") {
    return {
      minutesUsed: 0,
      minutesRemaining: Infinity,
      monthlyLimit: Infinity,
      resetDate: new Date(user.translationUsageResetDate),
      isLimitReached: false,
    };
  }
  
  const minutesUsed = user.monthlyTranslationMinutesUsed;
  const minutesRemaining = Math.max(0, FREE_TIER_MONTHLY_LIMIT_MINUTES - minutesUsed);
  const isLimitReached = minutesUsed >= FREE_TIER_MONTHLY_LIMIT_MINUTES;
  
  return {
    minutesUsed,
    minutesRemaining,
    monthlyLimit: FREE_TIER_MONTHLY_LIMIT_MINUTES,
    resetDate: new Date(user.translationUsageResetDate),
    isLimitReached,
  };
}

// Check if user can translate (has minutes remaining or is premium)
export async function canUserTranslate(userId: string): Promise<boolean> {
  const usage = await getUserUsageInfo(userId);
  return !usage.isLimitReached;
}

// Add translation minutes to user's usage
export async function addTranslationMinutes(userId: string, minutes: number): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) return;
  
  // Don't track usage for premium users
  if (user.subscriptionTier === "premium") {
    return;
  }
  
  await db.update(users)
    .set({
      monthlyTranslationMinutesUsed: user.monthlyTranslationMinutesUsed + Math.ceil(minutes),
    })
    .where(eq(users.id, userId));
}

// Middleware to check translation limits (for authenticated users)
export async function checkTranslationLimit(req: any, res: any, next: any) {
  // If user is not authenticated, they can still use translation (no limits for anonymous users)
  if (!req.user) {
    return next();
  }
  
  const canTranslate = await canUserTranslate(req.user.id);
  
  if (!canTranslate) {
    const usage = await getUserUsageInfo(req.user.id);
    return res.status(429).json({
      error: "Monthly translation limit reached",
      minutesUsed: usage.minutesUsed,
      monthlyLimit: usage.monthlyLimit,
      resetDate: usage.resetDate,
      message: "You've used all 2 hours of free translation this month. Upgrade to Premium for unlimited translations!",
    });
  }
  
  next();
}
