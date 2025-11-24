import type { User } from "@shared/schema";

export function isPremiumUser(user: User | null | undefined): boolean {
  // In development, all authenticated users have premium access for testing
  if (import.meta.env.DEV) {
    return !!user;
  }
  
  // Check for complimentary access (for friends/special users)
  if (user?.hasComplimentaryAccess) {
    return true;
  }
  
  return user?.subscriptionTier === "premium";
}
