# PayPal to Google Sheets Integration

A full-stack application that syncs PayPal transactions to Google Sheets and displays them in a beautiful dashboard.

## Features

- 🔄 Sync PayPal transactions to Google Sheets
- 📊 View transactions in a modern dashboard
- 🔍 Filter by email and date range
- 📅 Separate Day, Month, Year columns for easy analysis
- 💰 Displays Amount, Fee, Net, Currency, and Status

## Tech Stack

### Backend
- Node.js + Express
- PayPal Reporting API
- Google Apps Script (for Sheets integration)

### Frontend
- React + Vite
- Tailwind CSS

## Setup

### Prerequisites
- Node.js 18+
- PayPal Developer Account (Live or Sandbox)
- Google Account with Google Sheets

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Create `.env` file:
   ```
   PORT=5000
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=live
   GOOGLE_SCRIPT_URL=your_google_apps_script_url
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Google Apps Script Setup

1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Copy the code from `google-apps-script.js`
4. Deploy as Web App (Execute as: Me, Access: Anyone)
5. Copy the Web App URL to your `.env` file

## Usage

1. Open the dashboard at `http://localhost:5173`
2. Click "Sync Now" to fetch latest PayPal transactions
3. Use filters to search by email or date range

## License

MIT
