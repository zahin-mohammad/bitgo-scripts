import winston from "winston";
import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

declare module "express-serve-static-core" {
  interface Request {
    metadata: Record<string, unknown>;
  }
}

const app = express();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "bitgo-proxy" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "server.log" }),
    new winston.transports.Console({ format: winston.format.json() }),
  ],
});

const bitgoApi = "https://app.bitgo-test.com";
const secretAccessToken =
  "v2x6efc1ac9ed356ffeffade3bffd52bb2c66baffa8a39bc6497efbb0317bdadc1e";

app.all("*", function (req: Request, res: Response, next: NextFunction) {
  req.metadata = {
    startTime: new Date().getTime() / 1000,
  };
  req.headers.authorization = `Bearer ${secretAccessToken}`;
  next();
});

app.use(
  "/",
  createProxyMiddleware({
    target: bitgoApi,
    changeOrigin: true,
  })
);

app.listen(3000);
logger.info(`Proxy POC listening at localhost:3000`);
