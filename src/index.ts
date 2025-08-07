import express, { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
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

apiRouter.get("/health", makeEnsureAuthenticated(authProvider), (req, res) => {
  res.send("OK");
});

apiRouter.use(
  "/users",
  makeEnsureAuthenticated(authProvider),
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "",
    },
  })
);

apiRouter.use(
  "/transactions",
  makeEnsureAuthenticated(authProvider),
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/api/transactions": "",
    },
  })
);

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`🚀 API Gateway is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Use routes like: http://localhost:${port}/api/users`);
});
