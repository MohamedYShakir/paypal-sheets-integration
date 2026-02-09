const express = require('express');
const router = express.Router();
const paypalService = require('../services/paypalService');
const sheetsService = require('../services/sheetsService');

// Get transactions from PayPal and save to Sheets
router.get('/sync', async (req, res) => {
    try {
        // 1. Fetch all transactions from PayPal (last 12 months)
        const paypalTransactions = await paypalService.getTransactions();

        // 2. Fetch existing data from Sheets to check for duplicates
        const sheetData = await sheetsService.getData();
        const existingIds = new Set(sheetData.map(row => row['Transaction ID']));

        // 3. Filter out transactions that already exist
        const newTransactions = paypalTransactions.filter(t => {
            const id = t.transaction_info.transaction_id;
            return !existingIds.has(id);
        });

        console.log(`Found ${paypalTransactions.length} total, ${newTransactions.length} new transactions.`);

        // 4. Append only new transactions
        if (newTransactions.length > 0) {
            await sheetsService.appendData(newTransactions);
        }

        res.json({
            success: true,
            totalFetched: paypalTransactions.length,
            newAdded: newTransactions.length,
            data: newTransactions
        });

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
