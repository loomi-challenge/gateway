export interface IAuthProvider {
  verifyToken(token: string): Promise<{
    id: string;
    email: string;
  }>;
}
