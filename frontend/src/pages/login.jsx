import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "../auth/firebase";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [user, setUser] = useState(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if(isAuthenticated){
      navigate("/")
    }
  }, [])
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const sendOTP = async () => {
    setIsSendingOTP(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/auth/verifyPhone`,
        {
          phone,
        }
      );
      console.log(response);
      if (response.status == 200) {
        console.log("Correct");
        setPhone(response.data.phone)
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      const confirmation = await signInWithPhoneNumber(
        auth,
        response.data.phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      toast("OTP sent !");
      setTimer(60);
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error?.response?.status == 404) {
        toast.error("Invalid Phone Number");
      } else {
        toast.error("OTP couldn't be sent!");
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    setIsVerifyingOTP(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result) {
        console.log(result._tokenResponse);
        await navigate("/");
        await saveCred(result._tokenResponse)
        toast.dismiss()
        toast("Login Successful!");
        login(result.user.phoneNumber);
        setUser(result.user);
        navigate("/analysis")
      }
    } catch (error) {
      toast.error("Invalid OTP");
      console.error(error);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const saveCred=async({idToken, refreshToken})=>{

    try {
      const res= await axios.post(`${import.meta.env.VITE_BASE_ADDRESS}/auth/login`, {
        idToken,
        refreshToken
      },
      { withCredentials: true })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <img className="mx-auto h-36 w-auto" src={logo} alt="Genoviq Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {!user ? (
          <>
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="phone" className="sr-only">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Phone Number"
                />
              </div>
              <div>
                <button
                  onClick={sendOTP}
                  disabled={isSendingOTP || timer > 0}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {isSendingOTP
                    ? "Sending..."
                    : timer > 0
                    ? `Resend OTP (${timer}s)`
                    : "Send OTP"}
                </button>
              </div>
              <div id="recaptcha-container"></div>
            </div>

            {confirmationResult && (
              <div className="mt-8 space-y-6">
                <div>
                  <label htmlFor="otp" className="sr-only">
                    OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter OTP"
                  />
                </div>
                <div>
                  <button
                    onClick={verifyOTP}
                    disabled={isVerifyingOTP}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isVerifyingOTP ? "Verifying..." : "Login"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <h3>✅ OTP Verified! Welcome {user.phoneNumber}</h3>
        )}
      </motion.div>
    </div>
  );
} 