import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2C001E]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#E95420] mb-6">Unauthorized Access</h1>
        <p className="text-xl text-[#AEA79F] mb-8">You do not have permission to access this page.</p>
        <Link to="/" className="inline-block bg-[#E95420] text-white px-6 py-2 rounded-md hover:bg-[#C34113] transition-colors duration-200">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

