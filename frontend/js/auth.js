// Constants
const API_URL = '/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  checkLoggedInStatus();
  
  // Set up event listeners
  setupEventListeners();
});

// Check if user is already logged in
function checkLoggedInStatus() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Redirect to home page or dashboard
    window.location.href = '/dashboard.html';
  }
}

// Set up event listeners
function setupEventListeners() {
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Save token to local storage
    localStorage.setItem('token', data.token);
    
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    showError(error.message || 'Login failed');
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Save token to local storage
    localStorage.setItem('token', data.token);
    
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    showError(error.message || 'Registration failed');
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorAlert.classList.remove('hidden');
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorAlert.classList.add('hidden');
  }, 5000);
} 