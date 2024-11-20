const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const Users = require('./routes/users');
const Frames = require('./routes/frames');
const Client = require('./routes/clients');
const Sales = require('./routes/sales');
const Expenses = require('./routes/expenses');
const Stocks = require('./routes/stocks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware global
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users', Users);
app.use('/api/frames', Frames);
app.use('/api/clients', Client);
app.use('/api/sales', Sales);
app.use('/api/expenses', Expenses);
app.use('/api/stocks', Stocks);



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
