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
        
        // Default to last 12 months (365 days) if not specified
        const finalEnd = endDate ? new Date(endDate) : new Date();
        const initialStart = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

        let allTransactions = [];
        let currentWindowStart = new Date(initialStart);

        console.log(`Starting 12-month sync from ${initialStart.toISOString()} to ${finalEnd.toISOString()}`);

        while (currentWindowStart < finalEnd) {
            // Calculate window end (start + 30 days or finalEnd)
            let currentWindowEnd = new Date(currentWindowStart.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (currentWindowEnd > finalEnd) {
                currentWindowEnd = finalEnd;
            }

            console.log(`Fetching window: ${currentWindowStart.toISOString()} -> ${currentWindowEnd.toISOString()}`);

            let page = 1;
            let totalPages = 1;
            
            do {
                try {
                    const response = await axios.get(`${BASE_URL}/v1/reporting/transactions`, {
                        params: {
                            start_date: currentWindowStart.toISOString(),
                            end_date: currentWindowEnd.toISOString(),
                            fields: 'all',
                            page_size: 500,
                            page: page
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const details = response.data.transaction_details || [];
                    allTransactions = allTransactions.concat(details);
                    
                    totalPages = response.data.total_pages || 1;
                    console.log(`  Page ${page}/${totalPages} - Got ${details.length} items`);
                    page++;
                } catch (e) {
                    console.error(`  Error in window ${currentWindowStart.toISOString()}:`, e.response?.data || e.message);
                    // If auth fails, stop everything
                    if (e.response?.status === 401) throw e;
                    // Otherwise break this window loop and try next
                    break;
                }

            } while (page <= totalPages);

            // Move start to next window (+1 second)
            currentWindowStart = new Date(currentWindowEnd.getTime() + 1000); 
        }

        console.log(`Fetched total ${allTransactions.length} transactions across all windows.`);
        return allTransactions;

    } catch (error) {
        console.error('Error fetching PayPal transactions:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch transactions');
    }
}

module.exports = { getTransactions };
