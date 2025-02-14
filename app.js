import express from 'express';

const app = express();
import cors from 'cors'
import companyRoutes from './routes/companyRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import verifyFirebaseToken from './middlewares/authMiddleware.js';
import authRouter from "./routes/authRoutes.js"
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
import { upload } from './config/multer.js';
import {  uploadToCloudinary } from './config/cloudinary.js';



dotenv.config();
app.use(express.json());
app.use(cookieParser())
app.use(cors());

  app.get("/", (req, res) => res.json({ message: "Hello from Lambda-Express @Genoviq!" }));

app.post("/uploadimage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ message: "Upload successful", ...result });

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});


app.use('/auth', authRouter);
app.use('/companies',verifyFirebaseToken, companyRoutes);
app.use('/managers',verifyFirebaseToken, managerRoutes);
app.use('/regions',verifyFirebaseToken, regionRoutes);
app.use('/employees',verifyFirebaseToken, employeeRoutes);


export default app;