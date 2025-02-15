import admin from "../config/firebaseAdmin.js";
import axios from "axios";

const FIREBASE_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`;

// Middleware to verify ID token & refresh if expired
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const idToken = req.cookies.idToken;
    const refreshToken = req.cookies.refreshToken;

    // if (!idToken) {
    //   return res.status(401).json({ error: "Unauthorized: No token provided" });
    // }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      return next();
    } catch (error) {
      // If the token has expired, try to refresh it
      if (refreshToken) {
        try {
          const response = await axios.post(
            FIREBASE_REFRESH_URL,
            {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log(response.data);

          const newIdToken = response.data.id_token;

          res.cookie("idToken", newIdToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 60 * 60 * 1000, // 1 hour
          });
          // Verify and attach new token to request
          req.user = await admin.auth().verifyIdToken(newIdToken);
          return next();
        } catch (refreshError) {
          return res.status(403).json({ error: "Invalid refresh token" });
        }
      }

      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default verifyFirebaseToken;
