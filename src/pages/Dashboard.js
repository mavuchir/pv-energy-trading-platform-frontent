import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import HouseholdDashboard from '../components/Dashboard/HouseholdDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {user.role === 'admin' ? <AdminDashboard /> : <HouseholdDashboard />}
    </div>
  );
};

export default Dashboard;

