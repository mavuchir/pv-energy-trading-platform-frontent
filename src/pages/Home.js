import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"
import {
  FaSolarPanel,
  FaChartLine,
  FaExchangeAlt,
  FaUsers,
  FaLightbulb,
  FaCloudSunRain,
  FaArrowRight
} from "react-icons/fa"

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-teal-500">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-20"
            src="/placeholder.svg?height=1080&width=1920"
            alt="Energy Management"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Smart Energy Management
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-white">
            Monitor, optimize, and trade energy within your community. Take control of your energy
            production and consumption with our intelligent management system.
          </p>
          <div className="mt-10 flex items-center space-x-6">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Go to Dashboard <FaArrowRight className="ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-teal-600 tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Harness the power of renewable energy
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our integrated platform provides everything you need to monitor, optimize, and trade energy.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaSolarPanel className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Energy Monitoring
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Real-time monitoring of your energy production and consumption. Track solar panel
                      output, battery storage, and household usage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaChartLine className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Predictive Analytics
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      AI-powered predictions for energy production and consumption based on weather
                      forecasts and historical data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaExchangeAlt className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Energy Trading
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Buy and sell excess energy with your community. Set your prices and trade
                      automatically based on your energy needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaUsers className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Community Engagement
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Join energy communities to share resources, reduce costs, and create a more
                      sustainable energy ecosystem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaLightbulb className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Smart Optimization
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Intelligent suggestions to optimize energy usage based on your habits, weather
                      conditions, and energy prices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-md shadow-lg">
                        <FaCloudSunRain className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      Weather Integration
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Real-time weather data and forecasts to predict solar energy production and
                      optimize your energy usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-teal-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Sign up now for a free trial.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-teal-200">
            Join thousands of households already managing their energy more efficiently.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Features
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Pricing
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                FAQ
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Energy Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
