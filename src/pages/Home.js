"use client"

import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FaSolarPanel, FaExchangeAlt, FaUsers, FaChartLine, FaSignInAlt } from "react-icons/fa"

const Home = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-teal-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Energy Trading Platform</h1>
              <p className="text-xl mb-8">
                Optimize your energy usage, trade excess power, and join a sustainable community.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/login"
                  className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="bg-teal-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-800 transition-colors flex items-center justify-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Energy Trading Platform"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <FaSolarPanel className="text-yellow-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Energy Management</h3>
              <p className="text-gray-600">Monitor and optimize your energy production and consumption in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <FaExchangeAlt className="text-teal-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">P2P Trading</h3>
              <p className="text-gray-600">
                Buy and sell excess energy directly with other households in your community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Network</h3>
              <p className="text-gray-600">
                Join a network of like-minded individuals committed to sustainable energy.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">Get AI-powered insights and recommendations to maximize efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your System</h3>
              <p className="text-gray-600">
                Link your solar panels, battery storage, and smart appliances to our platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor & Optimize</h3>
              <p className="text-gray-600">
                Track your energy usage and get personalized recommendations for improvement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Trade & Save</h3>
              <p className="text-gray-600">
                Buy when prices are low, sell when high, and reduce your overall energy costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join the Energy Revolution?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start managing your energy smarter today and become part of a sustainable future.
          </p>
          <Link
            to="/register"
            className="bg-white text-teal-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">EnergyTrade</h3>
              <p className="text-gray-400">The smart platform for energy management and peer-to-peer trading.</p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">info@energytrade.com</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EnergyTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
