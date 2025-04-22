// Authentication service for handling tokens and auth headers

// Get the authentication token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set the authentication token in localStorage
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Remove the authentication token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get authentication headers for API requests
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Login function
export const login = async (username, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }

    setToken(data.access_token);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

// Register function
export const register = async (userData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Registration failed');
    }

    setToken(data.access_token);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// Logout function
export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      // Optional: Call logout endpoint
      await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    removeToken();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    removeToken(); // Still remove token even if API call fails
    return { success: true };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Failed to fetch user profile');
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
};

// Default export for the service
const authService = {
  getToken,
  setToken,
  removeToken,
  getAuthHeaders,
  isAuthenticated,
  login,
  register,
  logout,
  getUserProfile,
};

export default authService;
