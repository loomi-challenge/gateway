import { AuthenticatedUser } from "@/application/interfaces/IAuthProvider";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
