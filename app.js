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

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(
  cors({
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

app.get("/", (req, res) =>
  res.json({ message: "Hello from Lambda-Express @Genoviq!" })
);



app.use("/auth", authRouter);
app.use("/companies", verifyFirebaseToken, companyRoutes);
app.use("/managers", verifyFirebaseToken, managerRoutes);
app.use("/regions", verifyFirebaseToken, regionRoutes);
app.use("/employees", verifyFirebaseToken, employeeRoutes);

export default app;
