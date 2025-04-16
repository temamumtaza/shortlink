const crypto = require('crypto');
const Link = require('../models/Link');

/**
 * Generate a random slug of specified length
 * @param {number} length - Length of the slug
 * @returns {string} - Generated slug
 */
const generateRandomSlug = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Generate a unique slug by checking against the database
 * @param {number} length - Length of the slug
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (length = 6) => {
  let isUnique = false;
  let slug = '';
  
  while (!isUnique) {
    slug = generateRandomSlug(length);
    
    // Check if slug exists in database
    const existingLink = await Link.findOne({ slug });
    
    if (!existingLink) {
      isUnique = true;
    }
  }
  
  return slug;
};

module.exports = {
  generateRandomSlug,
  generateUniqueSlug
}; 