const axios = require('axios');
require('dotenv').config();

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

async function appendData(transactions) {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('GOOGLE_SCRIPT_URL is not set. Skipping sync.');
        return;
    }

    const payload = transactions.map(t => {
        const info = t.transaction_info;
        const payer = t.payer_info || {};
        const payerName = payer.payer_name
            ? `${payer.payer_name.given_name || ''} ${payer.payer_name.surname || ''}`.trim()
            : 'N/A';

        const amountVal = parseFloat(info.transaction_amount?.value || 0);

        const statusMap = {
            'S': 'Completed',
            'P': 'Pending',
            'D': 'Denied',
            'V': 'Reversed',
            'F': 'Failed'
        };
        const rawStatus = info.transaction_status || 'N/A';
        const formattedStatus = statusMap[rawStatus] || rawStatus;

        // Format Date to DD/MM/YYYY
        const dateObj = new Date(info.transaction_initiation_date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        return {
            date: formattedDate,
            day: day,
            month: month,
            year: year,
            id: info.transaction_id,
            email: payer.email_address || 'N/A',
            name: payerName,
            amount: info.transaction_amount?.value || '0',
            fee: info.fee_amount?.value || '0',
            net: (amountVal + (parseFloat(info.fee_amount?.value || 0))).toFixed(2),
            currency: info.transaction_amount?.currency_code,
            status: formattedStatus
        };
    });

    try {
        const response = await axios.post(GOOGLE_SCRIPT_URL, payload);
        console.log('Appended to Sheet via GAS:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error appending to Sheet via GAS:', error.message);
        throw error;
    }
}

async function getData() {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('GOOGLE_SCRIPT_URL is not set. Returning empty data.');
        return [];
    }

    try {
        const response = await axios.get(GOOGLE_SCRIPT_URL);
        if (response.data.result === 'success') {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching from Sheet via GAS:', error.message);
        throw error;
    }
}

module.exports = { appendData, getData };
