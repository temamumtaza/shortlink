// Constants
const API_URL = '/api';
const BASE_URL = `${window.location.protocol}//${window.location.host}`;

// DOM Elements
const navLinksContainer = document.getElementById('navLinksContainer');
const linksTableBody = document.getElementById('linksTableBody');
const totalLinks = document.getElementById('totalLinks');
const totalClicks = document.getElementById('totalClicks');
const lastCreated = document.getElementById('lastCreated');
const searchLinks = document.getElementById('searchLinks');
const qrModal = document.getElementById('qrModal');
const qrCodeModalContent = document.getElementById('qrCodeModalContent');
const closeQrModal = document.getElementById('closeQrModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadQrBtn = document.getElementById('downloadQrBtn');

// State
let userLinks = [];
let currentUser = null;
let currentQrSlug = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupEventListeners();
});

// Initialize the app
async function init() {
  // Check if user is logged in
  await checkAuth();
  
  // Redirect if not logged in
  if (!currentUser) {
    window.location.href = '/login.html';
    return;
  }
  
  // Update UI with user info
  updateAuthUI();
  
  // Fetch user's links
  await fetchUserLinks();
}

// Check if user is authenticated
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    currentUser = null;
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
      currentUser = null;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    currentUser = null;
  }
}

// Update UI based on authentication state
function updateAuthUI() {
  // Update navigation links
  navLinksContainer.innerHTML = `
    <div class="flex items-center">
      <span class="text-gray-600 mr-4">
        <i class="fas fa-user mr-2"></i>${currentUser.email}
      </span>
      <button id="logoutButton" class="btn btn-secondary">
        <i class="fas fa-sign-out-alt mr-2"></i>Logout
      </button>
    </div>
  `;
  
  // Add logout event listener
  document.getElementById('logoutButton').addEventListener('click', logout);
}

// Set up event listeners
function setupEventListeners() {
  // Search links
  if (searchLinks) {
    searchLinks.addEventListener('input', handleSearch);
  }
  
  // QR Modal close buttons
  if (closeQrModal) {
    closeQrModal.addEventListener('click', closeModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  // Download QR button
  if (downloadQrBtn) {
    downloadQrBtn.addEventListener('click', downloadQrCode);
  }
}

// Fetch user's links
async function fetchUserLinks() {
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
    userLinks = data.data;
    
    // Display links
    displayLinks(userLinks);
    
    // Update stats
    updateStats(userLinks);
  } catch (error) {
    console.error('Error fetching user links:', error);
  }
}

// Display links in the table
function displayLinks(links) {
  if (links.length === 0) {
    linksTableBody.innerHTML = `
      <tr id="noLinksRow">
        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
          You haven't created any links yet
        </td>
      </tr>
    `;
    return;
  }
  
  // Create HTML for links
  const linksHTML = links.map(link => {
    const shortUrl = `${BASE_URL}/${link.slug}`;
    const date = new Date(link.created_at);
    
    return `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <a href="${shortUrl}" target="_blank" class="text-primary-600 hover:underline">${shortUrl}</a>
            <button class="copy-btn ml-2 text-gray-500 hover:text-gray-700" data-url="${shortUrl}">
              <i class="far fa-copy"></i>
            </button>
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="max-w-xs truncate" title="${link.original_url}">
            ${link.original_url}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${link.clicks}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          ${date.toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <button class="qr-btn text-blue-600 hover:text-blue-800 mr-4" data-slug="${link.slug}">
            <i class="fas fa-qrcode"></i>
          </button>
          <button class="delete-btn text-red-600 hover:text-red-800" data-id="${link._id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  // Update UI
  linksTableBody.innerHTML = linksHTML;
  
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
      currentQrSlug = slug;
      await showQrModal(slug);
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

// Update dashboard stats
function updateStats(links) {
  // Total links
  totalLinks.textContent = links.length;
  
  // Total clicks
  const clicks = links.reduce((sum, link) => sum + link.clicks, 0);
  totalClicks.textContent = clicks;
  
  // Last created
  if (links.length > 0) {
    // Sort links by creation date
    const sortedLinks = [...links].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    const latestLink = sortedLinks[0];
    const date = new Date(latestLink.created_at);
    
    lastCreated.textContent = date.toLocaleDateString();
  } else {
    lastCreated.textContent = '-';
  }
}

// Handle search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    displayLinks(userLinks);
    return;
  }
  
  // Filter links based on search term
  const filteredLinks = userLinks.filter(link => 
    link.slug.toLowerCase().includes(searchTerm) ||
    link.original_url.toLowerCase().includes(searchTerm)
  );
  
  displayLinks(filteredLinks);
}

// Show QR code modal
async function showQrModal(slug) {
  try {
    const response = await fetch(`${API_URL}/qr/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    const data = await response.json();
    
    // Display QR code
    qrCodeModalContent.innerHTML = `
      <img src="${data.data.qr_code}" alt="QR Code" class="mx-auto max-w-full h-auto" id="qrCodeImage">
      <p class="mt-4 text-gray-600">${data.data.short_url}</p>
    `;
    
    // Show modal
    qrModal.classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching QR code:', error);
    alert('Failed to generate QR code');
  }
}

// Close QR modal
function closeModal() {
  qrModal.classList.add('hidden');
  currentQrSlug = null;
}

// Download QR code
function downloadQrCode() {
  const qrImage = document.getElementById('qrCodeImage');
  
  if (!qrImage) {
    return;
  }
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.download = `qrcode-${currentQrSlug}.png`;
  link.href = qrImage.src;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  window.location.href = '/';
} 