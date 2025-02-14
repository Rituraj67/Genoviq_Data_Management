
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload } from "lucide-react"
import { toast } from "react-toastify"

export default function AddCompanyModal({ isOpen, onClose, onAddCompany }) {
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!companyLogo){
      toast.error("Company logo is required!");
      return;
    }
    const formdata= new FormData();
    formdata.append("name", companyName);
    formdata.append("ggcimage", companyLogo)
    console.log(...formdata);
    onAddCompany(formdata)
    setCompanyName("")
    setCompanyLogo(null)
    onClose()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCompanyLogoPreview(e.target.result)
      setCompanyLogo(file)
      reader.readAsDataURL(file)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-lg p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Company</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current.click()}
              >
                {companyLogo ? (
                  <img
                    src={companyLogoPreview || "/placeholder.svg"}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={32} className="text-gray-400" />
                )}
              </motion.div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Company
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

