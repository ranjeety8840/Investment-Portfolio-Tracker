# Investment Portfolio Tracker - Setup Guide

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## Installation Steps

### 1. Clone the Repository (if applicable)
```bash
git clone <repository-url>
cd investment-portfolio-tracker
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
copy .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/investment_portfolio

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# External APIs (Optional - for real market data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
COINGECKO_API_KEY=your_coingecko_api_key
IEX_CLOUD_API_KEY=your_iex_cloud_api_key
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Database Setup

### MongoDB Local Installation

1. **Install MongoDB Community Edition**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow the installation instructions for your operating system

2. **Start MongoDB Service**
   
   **Windows:**
   ```bash
   net start MongoDB
   ```
   
   **macOS:**
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```
   
   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

### MongoDB Atlas (Cloud Option)

If you prefer using MongoDB Atlas (cloud database):

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment_portfolio
   ```

## API Keys Setup (Optional)

For real market data, you can obtain API keys from:

### Alpha Vantage (Stock Data)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get your free API key
3. Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key_here`

### CoinGecko (Cryptocurrency Data)
1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Get your API key
3. Add to `.env`: `COINGECKO_API_KEY=your_key_here`

### IEX Cloud (Financial Data)
1. Visit [IEX Cloud](https://iexcloud.io/)
2. Create an account and get your API key
3. Add to `.env`: `IEX_CLOUD_API_KEY=your_key_here`

**Note:** The application works with mock data even without API keys.

## Running the Application

1. **Start MongoDB** (if using local installation)
2. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```
4. **Access the Application:**
   - Open your browser and go to `http://localhost:3000`
   - Register a new account or login

## Production Deployment

### Backend Deployment

1. **Build for production:**
   ```bash
   npm install --production
   ```

2. **Set environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_secure_production_jwt_secret
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Serve the built files using a web server like Nginx or deploy to platforms like Netlify, Vercel, etc.**

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use:**
   - Change the PORT in `.env` file
   - Kill the process using the port: `npx kill-port 5000`

3. **CORS Errors:**
   - Ensure frontend URL is added to CORS configuration in backend
   - Check if both servers are running

4. **API Errors:**
   - Check if backend server is running
   - Verify API endpoints in browser dev tools
   - Check server logs for errors

### Logs and Debugging

- Backend logs are displayed in the terminal where you run `npm run dev`
- Frontend errors can be seen in browser developer tools (F12)
- Check network tab for API request/response details

## Features Overview

Once set up, you can:

1. **Register/Login** - Create an account and authenticate
2. **Create Portfolios** - Organize your investments
3. **Add Assets** - Track stocks, cryptocurrencies, bonds, etc.
4. **View Analytics** - Performance, diversification, and risk analysis
5. **Set Alerts** - Get notified on price changes
6. **Manage Profile** - Update preferences and settings

## Support

If you encounter any issues:

1. Check this setup guide
2. Review the troubleshooting section
3. Check the application logs
4. Ensure all prerequisites are installed correctly

## Security Notes

- Change the default JWT_SECRET in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies
- Use strong passwords for database access
