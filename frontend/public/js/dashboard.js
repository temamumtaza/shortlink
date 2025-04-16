// Constants
const API_URL = 'http://localhost:3001/api';
const BASE_URL = `${window.location.protocol}//${window.location.host}`;

// DOM Elements
const linksContainer = document.getElementById('linksContainer');
const logoutButton = document.getElementById('logoutButton');
const qrCodeModal = document.getElementById('qrCodeModal');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const closeModalButton = document.getElementById('closeModal');

// State
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupEventListeners();
});

// Initialize the app
async function init() {
  await checkAuth();
  await fetchLinks();
}

// Check if user is authenticated
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.data;
    } else {
      // Invalid token
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    window.location.href = '/login.html';
  }
}

// Set up event listeners
function setupEventListeners() {
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
  
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeQRCodeModal);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === qrCodeModal) {
      closeQRCodeModal();
    }
  });
}

// Fetch user's links
async function fetchLinks() {
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
    
    displayLinks(data.data);
  } catch (error) {
    console.error('Error fetching links:', error);
    showError('Failed to load your links');
  }
}

// Display links in the UI
function displayLinks(links) {
  if (!linksContainer) return;
  
  if (links.length === 0) {
    linksContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-500 mb-4">You haven't created any links yet.</p>
        <a href="/" class="btn btn-primary">Create Your First Link</a>
      </div>
    `;
    return;
  }
  
  const linksHTML = links.map(link => {
    const shortUrl = `${BASE_URL}/${link.slug}`;
    const date = new Date(link.created_at);
    
    return `
      <div class="card bg-white p-6 mb-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div class="mb-4 md:mb-0">
            <div class="flex items-center mb-2">
              <h3 class="font-semibold text-gray-800">${shortUrl}</h3>
              <button class="copy-btn ml-2 text-gray-500 hover:text-gray-700" data-url="${shortUrl}">
                <i class="far fa-copy"></i>
              </button>
            </div>
            <p class="text-gray-600 text-sm truncate max-w-md">${link.original_url}</p>
            <div class="flex items-center mt-2 text-sm text-gray-500">
              <span class="mr-4">
                <i class="fas fa-mouse-pointer mr-1"></i>
                ${link.clicks} clicks
              </span>
              <span>
                <i class="far fa-calendar-alt mr-1"></i>
                ${date.toLocaleDateString()}
              </span>
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
      </div>
    `;
  }).join('');
  
  linksContainer.innerHTML = linksHTML;
  
  // Add event listeners
  addLinkEventListeners();
}

// Add event listeners to link buttons
function addLinkEventListeners() {
  // Copy buttons
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
  
  // QR code buttons
  document.querySelectorAll('.qr-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.getAttribute('data-slug');
      await showQRCode(slug);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this link?')) {
        const id = btn.getAttribute('data-id');
        await deleteLink(id);
      }
    });
  });
}

// Show QR code modal
async function showQRCode(slug) {
  try {
    const response = await fetch(`${API_URL}/qr/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    const data = await response.json();
    
    // Display QR code in modal
    qrCodeContainer.innerHTML = `
      <img src="${data.data.qr_code}" alt="QR Code" class="mx-auto max-w-full h-auto">
    `;
    
    // Show modal
    qrCodeModal.classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching QR code:', error);
    showError('Failed to generate QR code');
  }
}

// Close QR code modal
function closeQRCodeModal() {
  qrCodeModal.classList.add('hidden');
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
    await fetchLinks();
  } catch (error) {
    console.error('Error deleting link:', error);
    showError('Failed to delete link');
  }
}

// Show error message
function showError(message) {
  const errorAlert = document.createElement('div');
  errorAlert.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
  errorAlert.textContent = message;
  
  document.body.appendChild(errorAlert);
  
  setTimeout(() => {
    errorAlert.remove();
  }, 5000);
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
} 