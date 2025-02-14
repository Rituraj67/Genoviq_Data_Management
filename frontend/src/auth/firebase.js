// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics,  } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCdEwTtX2sdpbmLg0kOzU3qAIPGHvay1Fw",
  authDomain: "genoviqhealthcare-3a7eb.firebaseapp.com",
  projectId: "genoviqhealthcare-3a7eb",
  storageBucket: "genoviqhealthcare-3a7eb.firebasestorage.app",
  messagingSenderId: "15593650574",
  appId: "1:15593650574:web:8b16e4a2757acc27790cdf",
  measurementId: "G-H12E00G7DT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
auth.useDeviceLanguage();

export { auth,analytics, RecaptchaVerifier, signInWithPhoneNumber };
