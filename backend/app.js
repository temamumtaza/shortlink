const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const linkRoutes = require('./routes/linkRoutes');
const authRoutes = require('./routes/authRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.use('/api', linkRoutes);
app.use('/api', authRoutes);

// Redirect route - pastikan parameter slug menggunakan pattern yang benar
app.get('/:slug([a-zA-Z0-9_-]+)', require('./controllers/linkController').redirectToUrl);

// Serve the frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

module.exports = app; 