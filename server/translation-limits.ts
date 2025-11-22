// Translation usage tracking and limits for free tier users
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const FREE_TIER_MONTHLY_LIMIT_MINUTES = 60; // 1 hour per month base
const AD_CREDIT_REWARD_MINUTES = 30; // 30 minutes per ad watched
const MAX_AD_CREDITS_MINUTES = 120; // Max 2 hours from watching ads

export interface UsageInfo {
  minutesUsed: number;
  minutesRemaining: number;
  monthlyLimit: number;
  adCreditsAvailable: number;
  totalAvailable: number;
  resetDate: Date;
  isLimitReached: boolean;
  canEarnAdCredits: boolean;
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
        adCreditsMinutes: 0, // Reset ad credits each month
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
      adCreditsAvailable: 0,
      totalAvailable: Infinity,
      resetDate: new Date(user.translationUsageResetDate),
      isLimitReached: false,
      canEarnAdCredits: false,
    };
  }
  
  const minutesUsed = user.monthlyTranslationMinutesUsed;
  const adCreditsAvailable = user.adCreditsMinutes || 0;
  const totalAvailable = FREE_TIER_MONTHLY_LIMIT_MINUTES + adCreditsAvailable;
  const minutesRemaining = Math.max(0, totalAvailable - minutesUsed);
  const isLimitReached = minutesUsed >= totalAvailable;
  const canEarnAdCredits = adCreditsAvailable < MAX_AD_CREDITS_MINUTES;
  
  return {
    minutesUsed,
    minutesRemaining,
    monthlyLimit: FREE_TIER_MONTHLY_LIMIT_MINUTES,
    adCreditsAvailable,
    totalAvailable,
    resetDate: new Date(user.translationUsageResetDate),
    isLimitReached,
    canEarnAdCredits,
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
      adCreditsAvailable: usage.adCreditsAvailable,
      totalAvailable: usage.totalAvailable,
      canEarnAdCredits: usage.canEarnAdCredits,
      resetDate: usage.resetDate,
      message: usage.canEarnAdCredits 
        ? "You've reached your limit. Watch a 30-second ad to get +30 minutes, or upgrade to Premium for unlimited!"
        : "You've used all available time this month. Upgrade to Premium for unlimited translations!",
    });
  }
  
  next();
}

// Redeem ad credits after user watches an ad
export async function redeemAdCredit(userId: string): Promise<UsageInfo> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Premium users don't need ad credits
  if (user.subscriptionTier === "premium") {
    throw new Error("Premium users have unlimited access");
  }
  
  const currentAdCredits = user.adCreditsMinutes || 0;
  
  // Check if user has reached max ad credits
  if (currentAdCredits >= MAX_AD_CREDITS_MINUTES) {
    throw new Error("You've already earned the maximum ad credits for this month");
  }
  
  // Add 30 minutes of ad credit
  const newAdCredits = Math.min(currentAdCredits + AD_CREDIT_REWARD_MINUTES, MAX_AD_CREDITS_MINUTES);
  
  await db.update(users)
    .set({
      adCreditsMinutes: newAdCredits,
    })
    .where(eq(users.id, userId));
  
  // Return updated usage info
  return await getUserUsageInfo(userId);
}
