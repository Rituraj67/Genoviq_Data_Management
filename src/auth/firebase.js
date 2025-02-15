// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics,  } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: "genoviqhealthcare-3a7eb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: "G-H12E00G7DT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
auth.useDeviceLanguage();

export { auth,analytics, RecaptchaVerifier, signInWithPhoneNumber };
