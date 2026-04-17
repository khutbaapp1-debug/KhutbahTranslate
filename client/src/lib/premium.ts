import type { User } from "@shared/schema";

// App is fully free — every visitor (signed-in or not) has access to all features.
// Kept as a function so existing callers don't need to change.
export function isPremiumUser(_user?: User | null): boolean {
  return true;
}
