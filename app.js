import express from "express";

const app = express();
import cors from "cors";
import companyRoutes from "./routes/companyRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import verifyFirebaseToken from "./middlewares/authMiddleware.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import punycode from "punycode";
global.punycode = punycode;


dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // Vite app
    credentials: true, // 🔥 Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 🔥 Include OPTIONS for preflight
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);


app.get("/", (req, res) =>
  res.json({ message: "Hello from Lambda-Express @Genoviq!" })
);
app.get("/greet", (req, res) =>
  res.json({ message: "Hello from Lambda-Express @Genoviq!" })
);

app.use("/auth", authRouter);
app.use("/companies", verifyFirebaseToken, companyRoutes);
app.use("/managers", verifyFirebaseToken, managerRoutes);
app.use("/regions", verifyFirebaseToken, regionRoutes);
app.use("/employees", verifyFirebaseToken, employeeRoutes);

export default app;
