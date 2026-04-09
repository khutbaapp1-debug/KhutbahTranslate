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

// Get user's current usage info — app is free, always return unlimited
export async function getUserUsageInfo(userId: string): Promise<UsageInfo> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw new Error("User not found");
  }

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

// Middleware to check translation limits — app is free, no limits enforced
export async function checkTranslationLimit(_req: any, _res: any, next: any) {
  return next();
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
