const express = require('express');
const { 
  shortenUrl, 
  getLinkStats, 
  generateQRCode, 
  getUserLinks, 
  deleteLink 
} = require('../controllers/linkController');
const { protect, getUserIfLoggedIn } = require('../middlewares/authMiddleware');

const router = express.Router();

// Link routes
router.post('/shorten', getUserIfLoggedIn, shortenUrl);
router.get('/stats/:slug', getLinkStats);
router.get('/qr/:slug', generateQRCode);
router.get('/links/me', protect, getUserLinks);
router.delete('/links/:id', protect, deleteLink);

module.exports = router; 