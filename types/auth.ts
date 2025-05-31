// e.g., types/auth.ts
export interface TokenPayload {
  userId: string;
  email?: string; // Optional, depending on your JWT structure
  iat: number;
  exp: number;
}