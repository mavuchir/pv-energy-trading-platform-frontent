import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Repeat, PieChart, Users } from 'lucide-react';
import TopNav from '../components/TopNav';
import Slider from 'react-slick';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <Icon className="w-12 h-12 text-teal-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ name, role, quote }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <div className="font-semibold">{name}</div>
    <div className="text-sm text-gray-500">{role}</div>
  </div>
);

const Home = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <TopNav />

      {/* Hero Section with Slider */}
      <section className="bg-teal-600 text-white pt-60 pb-40">
        <div className="container mx-auto">
          <Slider {...sliderSettings}>
            <div className="text-center  px-4">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
              >
                Empower Your Energy Future
              </motion.h1>
              <motion.p 
                className="text-xl mb-8"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join our community-driven energy trading platform and take control of your energy consumption and production.
              </motion.p>
            </div>
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Sustainable Energy for All</h1>
              <p className="text-xl mb-8">Create a greener future by participating in our innovative energy marketplace.</p>
            </div>
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Optimize Your Energy Usage</h1>
              <p className="text-xl mb-8">Use AI-powered tools to reduce costs and maximize efficiency in your energy consumption.</p>
            </div>
          </Slider>
          <div className="text-center">
            <Link to="/register" className="bg-white text-teal-600 py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-100 transition duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Zap}
              title="Real-time Energy Trading"
              description="Buy and sell excess energy within your community in real-time."
            />
            <FeatureCard
              icon={Repeat}
              title="Automated Optimization"
              description="AI-powered system optimizes your energy usage and trading automatically."
            />
            <FeatureCard
              icon={PieChart}
              title="Detailed Analytics"
              description="Get insights into your energy production, consumption, and trading patterns."
            />
            <FeatureCard
              icon={Users}
              title="Community Engagement"
              description="Connect with your neighbors and build a sustainable energy community."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account and connect your smart meter.</p>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-teal-500" />
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Set Preferences</h3>
              <p className="text-gray-600">Configure your energy goals and trading preferences.</p>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-teal-500" />
            <div className="text-center">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Trading</h3>
              <p className="text-gray-600">Begin trading excess energy with your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Reduce Energy Costs</h3>
              <p className="text-gray-600">Save money by optimizing your energy usage and trading excess energy.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Increase Sustainability</h3>
              <p className="text-gray-600">Contribute to a greener future by efficiently using and sharing renewable energy.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Earn Extra Income</h3>
              <p className="text-gray-600">Generate additional revenue by selling your excess energy to neighbors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Homeowner"
              quote="This platform has revolutionized how I think about energy. I'm saving money and helping the environment!"
            />
            <TestimonialCard
              name="Michael Chen"
              role="Solar Panel Owner"
              quote="I love being able to share my excess solar energy with my neighbors. It's a win-win for everyone."
            />
            <TestimonialCard
              name="Emily Rodriguez"
              role="Community Leader"
              quote="Our neighborhood has become more connected and sustainable thanks to this amazing platform."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <motion.section 
        className="bg-teal-600 text-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Energy Usage?</h2>
          <p className="text-xl mb-8">Join our community today and start making a difference.</p>
          <Link to="/register" className="bg-white text-teal-600 py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-100 transition duration-300">
            Sign Up Now
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;

