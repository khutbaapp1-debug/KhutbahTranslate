import type { User } from "@shared/schema";

// App is free — all signed-in users have access to all features
export function isPremiumUser(user: User | null | undefined): boolean {
  return !!user;
}
