
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth-context";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addCompany, setCompanies } from "../redux/companiesSlice";
import { PlusCircle } from "lucide-react";
import AddCompanyModal from "../components/AddCompanyModel";

export default function Analysis() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const companies = useSelector((state) => state.companies.value);
  const dispatch = useDispatch();
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      getCompanies();
    }
  }, [isAuthenticated, navigate]);

  const getCompanies = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_ADDRESS}/companies`,
        {
          withCredentials: true,
        }
      );
      console.log(res);
      dispatch(setCompanies(res.data));
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleAddCompany = async (formData) => {
    console.log(...formData);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_ADDRESS}/companies`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
          withCredentials: true,
        },
      );
      console.log(res);
      dispatch(addCompany(res.data))
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <motion.button
            onClick={() => setIsAddingModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle size={20} />
            <span>Add Company</span>
          </motion.button>
        </div>
        <AnimatePresence>
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            >
              <div className="p-6 flex items-center justify-between bg-gray-50 border-b">
                <Link
                  to={`/analysis/${company.id}`}
                  className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={company.logo || "/placeholder.svg"}
                    alt={company.name}
                    className=" w-20 rounded-full object-cover"
                  />
                  <h2 className="text-2xl font-semibold">{company.name}</h2>
                </Link>
              </div>
              {/* <CompanyTable data={company.financialData} /> */}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <AddCompanyModal
        isOpen={isAddingModalOpen}
        onClose={() => setIsAddingModalOpen(false)}
        onAddCompany={handleAddCompany}
      />
    </div>
  );
}
