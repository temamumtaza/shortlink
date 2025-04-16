# ShortLink - URL Shortener

A simple, elegant URL shortener web application with user authentication, custom slugs, QR code generation, and click tracking.

## Features

- Shorten long URLs with random slugs
- Create custom slugs (with user authentication)
- QR code generation for each shortened URL
- Click tracking and statistics
- User authentication (register/login)
- User dashboard to manage links
- Responsive design with Tailwind CSS

## Technology Stack

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code**: qrcode package

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/shortlink.git
cd shortlink
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   
   Create a `.env` file in the `backend` directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shortlink
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

4. Build CSS files:

```bash
npm run build:css
```

## Usage

### Development

Start the development server:

```bash
npm run dev
```

This will start the backend server and watch for CSS changes.

### Production

For production deployment:

```bash
npm start
```

## How It Works

1. **Anonymous Users**:
   - Can shorten URLs with random slugs
   - Can view QR codes and stats for created links
   - Cannot use custom slugs or manage links

2. **Authenticated Users**:
   - Can use custom slugs
   - Can see all their shortened links in the dashboard
   - Can delete their links
   - Can track click statistics

## API Endpoints

- `POST /api/shorten` - Create a new short link
- `GET /:slug` - Redirect to the original URL
- `GET /api/stats/:slug` - Get link statistics
- `GET /api/qr/:slug` - Generate QR code
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/links/me` - Get all links created by the logged-in user
- `DELETE /api/links/:id` - Delete a link

## License

This project is licensed under the ISC License. 