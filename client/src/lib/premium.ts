import type { User } from "@shared/schema";

export function isPremiumUser(user: User | null | undefined): boolean {
  // In development, all authenticated users have premium access for testing
  if (import.meta.env.DEV) {
    return !!user;
  }
  
  return user?.subscriptionTier === "premium";
}
