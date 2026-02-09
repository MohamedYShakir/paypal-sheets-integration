const express = require('express');
const router = express.Router();
const paypalService = require('../services/paypalService');
const sheetsService = require('../services/sheetsService');

// Get transactions from PayPal and save to Sheets
router.get('/sync', async (req, res) => {
    try {
        const transactions = await paypalService.getTransactions();
        // In a real app, you might want to filter or format this data before sending to sheets
        // For now, assuming transactions is an array of objects
        if (transactions.length > 0) {
            await sheetsService.appendData(transactions);
        }
        res.json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get data from Sheets to display on frontend
router.get('/data', async (req, res) => {
    try {
        const data = await sheetsService.getData();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Fetch data error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
