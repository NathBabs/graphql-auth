export interface IJwtPayload {
  sub: string; // User ID
  email: string; // User email
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}
