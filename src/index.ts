import express, { Router } from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import { makeEnsureAuthenticated } from "./infra/http/middlewares/ensureAuthenticated";
import { CognitoAuthProvider } from "./infra/auth/cognito-auth-provider";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRouter = Router();
const authProvider = new CognitoAuthProvider();

apiRouter.use(
  "/auth",
  proxy("localhost:3001", {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace("/api/auth", "/auth");
    }
  })
);

apiRouter.use(
  "/users",
  makeEnsureAuthenticated(authProvider),
  proxy("localhost:3001", {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace("/api/users", "");
    }
  })
);

apiRouter.use(
  "/transactions",
  makeEnsureAuthenticated(authProvider),
  proxy("localhost:3002", {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace("/api/transactions", "");
    }
  })
);

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`🚀 API Gateway is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Use routes like: http://localhost:${port}/api`);
});
