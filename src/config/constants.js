// API URL configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Energy market constants
export const ENERGY_UNITS = 'kWh';
export const CURRENCY = '$';

// Time constants
export const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds

// Trading constants
export const MIN_TRADE_AMOUNT = 0.1;
export const MAX_TRADE_AMOUNT = 1000;
export const DEFAULT_EXPIRY_HOURS = 24;

// Battery constants
export const DEFAULT_BATTERY_CAPACITY = 10; // kWh
