// Constants
const API_URL = 'http://127.0.0.1:3001/api';
const BASE_URL = 'http://127.0.0.1:3001';

// DOM Elements
const shortenForm = document.getElementById('shortenForm');
const originalUrlInput = document.getElementById('originalUrl');
const customSlugContainer = document.getElementById('customSlugContainer');
const customSlugInput = document.getElementById('customSlug');
const resultCard = document.getElementById('resultCard');
const shortUrlInput = document.getElementById('shortUrl');
const copyButton = document.getElementById('copyButton');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const clicksCount = document.getElementById('clicksCount');
const createdAt = document.getElementById('createdAt');
const loginPrompt = document.getElementById('loginPrompt');
const navLinksContainer = document.getElementById('navLinksContainer');
const userLinksSection = document.getElementById('userLinksSection');
const linksContainer = document.getElementById('linksContainer');

// State
let currentUser = null;
let currentLink = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupEventListeners();
});

// Initialize the app
async function init() {
  // Check if user is logged in
  currentUser = window.auth?.getCurrentUser() || null;
  
  // Update UI based on auth state
  updateAuthUI();
  
  // If user is logged in, fetch their links
  if (currentUser) {
    await fetchUserLinks();
  }
}

// Update UI based on authentication state
function updateAuthUI() {
  // Update navigation links
  if (currentUser) {
    navLinksContainer.innerHTML = `
      <div class="flex items-center">
        <a href="/dashboard.html" class="text-gray-600 hover:text-primary-600 mr-4">
          <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
        </a>
        <button id="logoutButton" class="btn btn-secondary">
          <i class="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
      </div>
    `;
    
    // Add logout event listener
    document.getElementById('logoutButton').addEventListener('click', logout);
    
    // Show custom slug input
    customSlugContainer.classList.remove('hidden');
    
    // Show user links section if we're on the homepage
    if (userLinksSection) {
      userLinksSection.classList.remove('hidden');
    }
  } else {
    navLinksContainer.innerHTML = `
      <div>
        <a href="/login.html" class="text-gray-600 hover:text-primary-600 mr-4">Log In</a>
        <a href="/register.html" class="btn btn-primary">Register</a>
      </div>
    `;
    
    // Hide custom slug input
    customSlugContainer.classList.add('hidden');
    
    // Hide user links section
    if (userLinksSection) {
      userLinksSection.classList.add('hidden');
    }
  }
}

// Set up event listeners
function setupEventListeners() {
  // Form submission
  if (shortenForm) {
    shortenForm.addEventListener('submit', handleShortenFormSubmit);
  }
  
  // Copy button
  if (copyButton) {
    copyButton.addEventListener('click', copyShortUrl);
  }
}

// Handle form submission to shorten URL
async function handleShortenFormSubmit(e) {
  e.preventDefault();
  
  let originalUrl = originalUrlInput.value.trim();
  const customSlug = customSlugInput.value.trim();
  
  if (!originalUrl) {
    alert('Please enter a URL');
    return;
  }

  // URL validation regex (matching backend requirements exactly)
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

  // Add https:// if no protocol is specified
  if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
    originalUrl = 'https://' + originalUrl;
  }

  // Validate URL format
  if (!urlRegex.test(originalUrl)) {
    alert('Please enter a valid URL (e.g., example.com or https://example.com)');
    return;
  }
  
  try {
    // Prepare request data
    const requestData = {
      original_url: originalUrl
    };
    
    // Add custom slug if provided
    if (customSlug) {
      requestData.slug = customSlug;
    }
    
    // Set request headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if user is logged in
    if (currentUser) {
      const token = localStorage.getItem('token');
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Send request to API
    const response = await fetch(`${API_URL}/shorten`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Check if user needs authentication for custom slug
      if (data.needsAuth) {
        showResult(null, true);
        return;
      }
      
      throw new Error(data.message || 'Failed to shorten URL');
    }
    
    // Save the current link
    currentLink = data.data;
    
    // Show result
    showResult(currentLink);
    
    // Fetch QR code
    fetchQRCode(currentLink.slug);
    
    // Clear form
    if (customSlug) {
      customSlugInput.value = '';
    }
    
    // If user is logged in, refresh their links
    if (currentUser) {
      await fetchUserLinks();
    }
  } catch (error) {
    alert(error.message || 'An error occurred');
  }
}

// Show the result card with shortened URL
function showResult(link, needsAuth = false) {
  if (link) {
    // Update result card with link data
    const shortUrl = `${BASE_URL}/${link.slug}`;
    shortUrlInput.value = shortUrl;
    clicksCount.textContent = link.clicks;
    
    // Format date
    const date = new Date(link.created_at);
    createdAt.textContent = date.toLocaleDateString();
    
    // Hide login prompt if user is logged in
    loginPrompt.classList.add('hidden');
  } else if (needsAuth) {
    // Show login prompt if custom slug requires authentication
    loginPrompt.classList.remove('hidden');
  }
  
  // Show result card
  resultCard.classList.remove('hidden');
}

// Copy short URL to clipboard
function copyShortUrl() {
  shortUrlInput.select();
  document.execCommand('copy');
  
  // Change button text temporarily
  const originalContent = copyButton.innerHTML;
  copyButton.innerHTML = '<i class="fas fa-check"></i>';
  
  setTimeout(() => {
    copyButton.innerHTML = originalContent;
  }, 2000);
}

// Fetch QR code for a slug
async function fetchQRCode(slug) {
  try {
    const response = await fetch(`${API_URL}/qr/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    const data = await response.json();
    
    // Display QR code
    qrCodeContainer.innerHTML = `
      <img src="${data.data.qr_code}" alt="QR Code" class="mx-auto max-w-full h-auto">
    `;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    qrCodeContainer.innerHTML = '<p class="text-red-500">Failed to load QR code</p>';
  }
}

// Fetch user's links
async function fetchUserLinks() {
  if (!currentUser || !userLinksSection) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/links/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }
    
    const data = await response.json();
    
    // Display user's links
    displayUserLinks(data.data);
  } catch (error) {
    console.error('Error fetching user links:', error);
  }
}

// Display user's links in the UI
function displayUserLinks(links) {
  if (!linksContainer) {
    return;
  }
  
  if (links.length === 0) {
    linksContainer.innerHTML = '<p class="text-gray-500">You haven\'t created any links yet.</p>';
    return;
  }
  
  // Create HTML for links
  const linksHTML = links.map(link => {
    const shortUrl = `${BASE_URL}/${link.slug}`;
    const date = new Date(link.created_at);
    
    return `
      <div class="card bg-white flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div class="mb-4 md:mb-0">
          <div class="flex items-center mb-2">
            <h3 class="font-semibold text-gray-800">${shortUrl}</h3>
            <button class="copy-btn ml-2 text-gray-500 hover:text-gray-700" data-url="${shortUrl}">
              <i class="far fa-copy"></i>
            </button>
          </div>
          <p class="text-gray-600 text-sm truncate max-w-md">${link.original_url}</p>
          <div class="flex items-center mt-2 text-sm text-gray-500">
            <span class="mr-4"><i class="fas fa-mouse-pointer mr-1"></i> ${link.clicks} clicks</span>
            <span><i class="far fa-calendar-alt mr-1"></i> ${date.toLocaleDateString()}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="qr-btn btn btn-secondary btn-sm" data-slug="${link.slug}">
            <i class="fas fa-qrcode"></i>
          </button>
          <button class="delete-btn btn btn-secondary btn-sm text-red-600" data-id="${link._id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Update UI
  linksContainer.innerHTML = linksHTML;
  
  // Add event listeners for copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      navigator.clipboard.writeText(url);
      
      // Change icon temporarily
      const icon = btn.querySelector('i');
      icon.className = 'fas fa-check';
      
      setTimeout(() => {
        icon.className = 'far fa-copy';
      }, 2000);
    });
  });
  
  // Add event listeners for QR code buttons
  document.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.getAttribute('data-slug');
      await fetchQRCode(slug);
    });
  });
  
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this link?')) {
        const id = btn.getAttribute('data-id');
        await deleteLink(id);
      }
    });
  });
}

// Delete a link
async function deleteLink(id) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete link');
    }
    
    // Refresh links
    await fetchUserLinks();
  } catch (error) {
    console.error('Error deleting link:', error);
    alert('Failed to delete link: ' + error.message);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  updateAuthUI();
  
  // Redirect to homepage if on dashboard
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = '/';
  }
} 