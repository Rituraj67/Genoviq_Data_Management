import app from "./app.js";
import { syncDatabase, initModels } from "./config/db.js";
import serverless from "serverless-http";

// ✅ Move database initialization out of Lambda execution
const startServer = async () => {
  try {
    await initModels();
    await syncDatabase();
    console.log("✅ Database synchronized successfully!");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
  }
};

// ✅ Start the database sync (only on cold starts)
startServer();

// ✅ Local Development Mode

  app.listen(3000, () => {
    console.log("🚀 App running locally on PORT 3000");
  });


// ✅ AWS Lambda Handler (Handles API Gateway Requests)
export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // Prevent Lambda from freezing

  return serverless(app)({
    ...event,
    headers: {
      ...event.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
};
