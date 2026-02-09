const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const APP_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const BASE_URL = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

console.log(`PayPal Service running in ${PAYPAL_MODE} mode`);

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${APP_SECRET}`).toString('base64');
    try {
        const response = await axios.post(`${BASE_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting PayPal access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to authenticate with PayPal');
    }
}

async function getTransactions(startDate, endDate) {
    try {
        const accessToken = await getAccessToken();
        // Default to last 30 days if not specified
        const end = endDate || new Date().toISOString();
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const response = await axios.get(`${BASE_URL}/v1/reporting/transactions?start_date=${start}&end_date=${end}&fields=all`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.transaction_details || [];
    } catch (error) {
        console.error('Error fetching PayPal transactions:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch transactions');
    }
}

module.exports = { getTransactions };
