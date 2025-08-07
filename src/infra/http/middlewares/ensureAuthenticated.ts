import { NextFunction, Request, Response } from "express";
import { IAuthProvider } from "../../../application/interfaces/auth-provider";

export function makeEnsureAuthenticated(authProvider: IAuthProvider) {
  const publicRoutes = [
    "/login",
    "/register",
    "/confirm-user",
    "/resend-code",
  ];

  return async function (req: Request, res: Response, next: NextFunction) {
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token missing" });
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const user = await authProvider.verifyToken(token);
        (req as any).user = user;

        req.headers["x-user-id"] = user.id;
        req.headers["x-user-email"] = user.email;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
