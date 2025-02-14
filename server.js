import app from "./app.js";
import { syncDatabase, initModels } from "./config/db.js";
import serverless from "serverless-http";

// Move database initialization inside a function
const startServer = async () => {
  try {
    await initModels();
    await syncDatabase();
    console.log("Database synchronized successfully!");
  } catch (error) {
    console.error("Database synchronization failed:", error);
  }
};



// app.listen(3000, ()=>{
//   console.log("App running on PORT 3000",);
// })

startServer();

export const handler = serverless(app);
