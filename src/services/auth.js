// services/auth.js

export const login = async (email, password) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Define mock users for different roles
  const users = {
    'household@example.com': { id: '1', email, role: 'household' },
    'admin@example.com': { id: '2', email, role: 'admin' },
    'user@example.com': { id: '3', email, role: 'customer' },
  };

  // Check if the provided email exists and return the corresponding user
  if (users[email] && password === 'password') { // Simulated password check
    return users[email];
  }

  throw new Error('Invalid credentials');
};

export const register = async (email, password, role) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, you would create a new user in the database
  return { id: '2', email, role };
};

export const getCurrentUser = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, you would validate the user's session and return their data
  return { id: '1', email: 'user@example.com', role: 'customer' };
};

export const logout = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, you would remove the user's session from your storage
  console.log('User logged out successfully');
  return true; // Indicating successful logout
};