import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css"
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Analysis from "./pages/analysis";
import CompanyAnalysis from "./pages/company-analysis";
import ManagerAnalysis from "./pages/manager-analysis";
import RegionAnalysis from "./pages/region-analysis";
import EmployeeAnalysis from "./pages/employee-analysis";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
import { useAuth } from "./context/auth-context";
import axios from "axios";
import Footer from "./components/Footer";


function App() {
  const { login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated)
      verifyToken();  
  }, [isAuthenticated])

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.pathname.endsWith("/login") && isAuthenticated) {
      navigate("/");
      toast("You are already logged in!", {
        icon: "ℹ️",
      });
    }
  }, [isAuthenticated, location.pathname]);
  const verifyToken = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/auth/verifyToken`,
        { withCredentials: true }
      );
      console.log(res);
      if (res.status == 202) {
        login(res.data.phone_number);
      }
    } catch (error) {
      if (error.response.status == 401) {
        console.log("token not fount");
      } else if (error.response.status == 403) {
        console.log("Invalid Token");
      } else {
        console.log(error);
      }
    }
    
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {!isAuthenticated && <Route path="/login" element={<Login />} />}
        {/* Protected Routes */}
        
          <>
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/:companyId" element={<CompanyAnalysis />} />
            <Route
              path="/analysis/:companyId/:managerId"
              element={<ManagerAnalysis />}
            />
            <Route
              path="/analysis/:companyId/:managerId/:regionId"
              element={<RegionAnalysis />}
            />
            <Route
              path="/analysis/:companyId/:managerId/:regionId/:employeeId"
              element={<EmployeeAnalysis />}
            />
          </>
      
      </Routes>
      <Footer/>
      <ToastContainer
        position="bottom-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
