const Link = require('../models/Link');
const { generateUniqueSlug } = require('../utils/generateSlug');
const qrcode = require('qrcode');

// @desc    Shorten URL
// @route   POST /api/shorten
// @access  Public (with limitations) / Private (full features)
exports.shortenUrl = async (req, res) => {
  try {
    const { original_url, slug } = req.body;
    
    // Validate URL
    if (!original_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a URL'
      });
    }
    
    // Ensure URL has http/https
    let formattedUrl = original_url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // If user provides slug and is authenticated
    if (slug && req.user) {
      // Validate slug
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return res.status(400).json({
          success: false,
          message: 'Slug can only contain letters, numbers, underscores and hyphens'
        });
      }
      
      // Check if slug is already taken
      const existingLink = await Link.findOne({ slug });
      
      if (existingLink) {
        return res.status(400).json({
          success: false,
          message: 'Slug is already taken'
        });
      }
      
      // Create link with custom slug
      const link = await Link.create({
        original_url: formattedUrl,
        slug,
        owner_id: req.user ? req.user._id : null
      });
      
      return res.status(201).json({
        success: true,
        data: link
      });
    }
    
    // If user wants custom slug but is not authenticated
    if (slug && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'You need to be logged in to use custom slugs',
        needsAuth: true
      });
    }
    
    // Create link with random slug
    const generatedSlug = await generateUniqueSlug();
    
    const link = await Link.create({
      original_url: formattedUrl,
      slug: generatedSlug,
      owner_id: req.user ? req.user._id : null
    });
    
    res.status(201).json({
      success: true,
      data: link
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Redirect to original URL
// @route   GET /:slug
// @access  Public
exports.redirectToUrl = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const link = await Link.findOne({ slug });
    
    if (!link) {
      return res.status(404).redirect('/'); // Redirect to homepage if slug not found
    }
    
    // Increment click count
    link.clicks += 1;
    await link.save();
    
    // Redirect to original URL
    res.redirect(link.original_url);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get link stats
// @route   GET /api/stats/:slug
// @access  Public
exports.getLinkStats = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const link = await Link.findOne({ slug });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        slug: link.slug,
        original_url: link.original_url,
        clicks: link.clicks,
        created_at: link.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate QR code for a link
// @route   GET /api/qr/:slug
// @access  Public
exports.generateQRCode = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const link = await Link.findOne({ slug });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Generate short URL for QR code (fix untuk menghindari error path-to-regexp)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${slug}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(shortUrl);
    
    res.status(200).json({
      success: true,
      data: {
        qr_code: qrCodeDataUrl,
        short_url: shortUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user links
// @route   GET /api/links/me
// @access  Private
exports.getUserLinks = async (req, res) => {
  try {
    const links = await Link.find({ owner_id: req.user._id }).sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      count: links.length,
      data: links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete link
// @route   DELETE /api/links/:id
// @access  Private
exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Check if link belongs to user
    if (link.owner_id && link.owner_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this link'
      });
    }
    
    await link.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 