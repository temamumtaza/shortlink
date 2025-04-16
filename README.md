# URL Shortener

A modern URL shortening service built with Node.js, Express, and MongoDB.

## Features

- Shorten long URLs to easy-to-share links
- Custom slug support for authenticated users
- QR code generation for shortened URLs
- Click tracking and analytics
- User authentication and link management
- Modern, responsive UI

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/temamumtaza/shortlink.git
   cd shortlink
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies (if any)
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   # Start backend server
   cd backend
   npm start
   ```

5. Open `http://localhost:3001` in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 