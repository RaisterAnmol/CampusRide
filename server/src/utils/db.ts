import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { logger } from "./logger";

let mongoMemoryServer: MongoMemoryServer | null = null;

export function maskMongoUri(rawUri: string): string {
  try {
    return rawUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1******$3');
  } catch {
    return "mongodb-cluster-redacted";
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === "production") {
    if (!uri || uri.trim().length === 0) {
      const errMsg = "FATAL: MONGODB_URI is required in production. In-memory database fallback is strictly disabled in production.";
      logger.error(errMsg);
      throw new Error(errMsg);
    }
  }

  if (uri && uri.trim().length > 0) {
    const trimmedUri = uri.trim();
    const isSrv = trimmedUri.startsWith("mongodb+srv://");
    const maskedUri = maskMongoUri(trimmedUri);

    try {
      console.log(
        `[Database] Attempting connection to configured ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"} at ${maskedUri}...`,
      );
      logger.info(
        `[Database] Attempting connection to configured ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"} at ${maskedUri}...`,
      );

      const conn = await mongoose.connect(trimmedUri, {
        serverSelectionTimeoutMS: isSrv ? 15000 : 5000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      console.log(
        `[Database] Successfully connected to ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"} at ${maskedUri}`,
      );
      logger.info(
        `[Database] Successfully connected to ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"} at ${maskedUri}`,
      );
      return conn;
    } catch (err: any) {
      if (process.env.NODE_ENV === "production") {
        throw err;
      }
      console.warn(
        `[Database] Failed to connect to ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"} (${err.message}).`,
      );
      if (isSrv) {
        console.warn(
          `[Database] Atlas SRV Tip: Check your IP Whitelist (Network Access 0.0.0.0/0 for dev) and database credentials.`,
        );
      }
      console.warn(
        `[Database] Falling back to isolated in-memory MongoDB engine...`,
      );
      logger.warn(
        { err },
        `[Database] Failed to connect to ${isSrv ? "MongoDB Atlas (SRV)" : "MongoDB"}. Falling back to in-memory engine.`,
      );
    }
  }

  // Fallback to MongoMemoryServer for reliable, zero-config local runs & tests
  try {
    console.warn(
      `[Database] [DEV-ONLY] Initializing isolated in-memory MongoDB engine (mongodb-memory-server). Data will reset on restart.`,
    );
    logger.info(
      `[Database] Initializing isolated MongoDB engine (mongodb-memory-server)...`,
    );
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to in-memory MongoDB at ${memoryUri}`);
    logger.info(`[Database] Connected to in-memory MongoDB at ${memoryUri}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Error starting MongoMemoryServer:`, err);
    logger.error({ err }, `[Database] Error starting MongoMemoryServer`);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
