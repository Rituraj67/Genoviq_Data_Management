import { motion } from "framer-motion"
import { useAuth } from "../context/auth-context"
import banner from "../assets/banner1.webp"

export default function Home() {

  const {isAuthenticated}= useAuth()
  return (
    <div className="min-h-screen pt-24">
      <div
        className="relative h-[90vh] bg-cover bg-center "
        style={{
          backgroundImage:
            `url('${banner}')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="container mx-auto px-4 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-5xl font-bold mb-4">Smart Insights for Smarter Decisions.</h1>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-lg">Get a complete financial overview of your business</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full  flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-lg">Keep an eye on salaries, sales, and productivity</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-lg">Track, analyze, and optimize—effortlessly</p>
                </div>
                {!isAuthenticated && <div className="flex items-center space-x-2">
                  <p className="text-lg">📌 Login now to unlock powerful insights and take control of your business growth!</p>
                </div>}
                <p className="text-xl mt-4 block text-start mb-8 italic">"What gets measured, gets managed." – Peter Drucker</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

