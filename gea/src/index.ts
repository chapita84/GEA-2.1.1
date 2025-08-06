import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
const next = require('next'); // <-- CAMBIO CLAVE AQUÍ

const isDev = process.env.NODE_ENV !== 'production';

const server = next({
  dev: isDev,
  conf: { distDir: '.next' },
});

const nextjsHandle = server.getRequestHandler();

export const gea = onRequest({ region: "us-central1" }, (req, res) => {
  logger.info("Request received", { path: req.path });
  return server.prepare().then(() => nextjsHandle(req, res));
});