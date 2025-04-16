const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Initializing ShortLink project...');

// Create directories if they don't exist
const directories = [
  'frontend/public/css',
  'frontend/css',
  'backend/controllers',
  'backend/models',
  'backend/routes',
  'backend/middlewares',
  'backend/utils'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Initialize Tailwind if needed
if (!fs.existsSync(path.join(__dirname, 'tailwind.config.js'))) {
  try {
    console.log('Initializing Tailwind CSS...');
    execSync('npx tailwindcss init -p', { stdio: 'inherit' });
    
    // Update the config file
    const configPath = path.join(__dirname, 'tailwind.config.js');
    const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/public/**/*.{html,js}",
    "./frontend/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
}`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('Tailwind CSS initialized successfully!');
  } catch (error) {
    console.error('Error initializing Tailwind CSS:', error.message);
  }
}

// Generate initial CSS
try {
  // Create source CSS file if it doesn't exist
  const sourceCssPath = path.join(__dirname, 'frontend/css/tailwind.css');
  if (!fs.existsSync(sourceCssPath)) {
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer components {
  .btn {
    @apply px-4 py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-400;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .card {
    @apply p-6 bg-white rounded-lg shadow-md;
  }
}`;
    fs.writeFileSync(sourceCssPath, cssContent);
    console.log('Created Tailwind CSS source file');
  }

  console.log('Building CSS...');
  try {
    execSync('npx tailwindcss -i ./frontend/css/tailwind.css -o ./frontend/public/css/styles.css', { stdio: 'inherit' });
    console.log('CSS built successfully!');
  } catch (cssError) {
    console.error('Error running Tailwind CSS build:', cssError.message);
    console.log('Trying alternative build method...');
    
    // Create a minimal CSS file as fallback
    const targetCssPath = path.join(__dirname, 'frontend/public/css/styles.css');
    const minimalCss = `/* Minimal styles */
.btn { padding: 0.5rem 1rem; border-radius: 0.25rem; font-weight: 600; }
.btn-primary { background-color: #0284c7; color: white; }
.btn-secondary { background-color: #e5e7eb; color: #1f2937; }
.card { padding: 1.5rem; background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
`;
    fs.writeFileSync(targetCssPath, minimalCss);
    console.log('Created minimal CSS file as fallback.');
  }
} catch (error) {
  console.error('Error building CSS:', error.message);
}

console.log('\nShortLink project is ready!');
console.log('Run "npm run dev" to start the development server');
console.log('Make sure to set up your MongoDB connection in the backend/.env file'); 