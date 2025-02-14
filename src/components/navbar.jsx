import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { Menu, X } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import axios from "axios";
import logo from "../assets/logo.png"

export default function Navbar() {
  const auth = getAuth();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    console.log("logout");
    await signOut(auth);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/auth/logout`,
        { withCredentials: true }
      );
      if (res.status == 200) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center space-x-6">
            <img
              src={logo}
              alt="Genoviq Logo"
              className="h-24 w-auto"
            />
            {/* <span className="text-xl font-bold text-gray-800 hidden sm:inline">
              Genoviq Data Management
            </span> */}
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                to="/analysis"
                className="text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-200"
              >
                Analysis Area
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated && (
              <Link
                to="/analysis"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Analysis Area
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
