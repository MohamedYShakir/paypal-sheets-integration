const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be added here
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Helper route to check if server is running
app.get('/', (req, res) => {
    res.send('PayPal Integration Server is Running! 🚀');
});

// Export the Express API
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
