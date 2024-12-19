require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 5000;

// Utilisez bodyParser pour toutes les autres routes
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Importez et utilisez les autres routes
const Users = require('./routes/users');
const Frames = require('./routes/frames');
const Client = require('./routes/clients');
const Sales = require('./routes/sales');
const Expenses = require('./routes/expenses');
const Stocks = require('./routes/stocks');
const Subscriptions = require('./routes/subscriptions');
const Repairs = require('./routes/repairs');
const Appointments = require('./routes/appointments');
const Opticians = require('./routes/opticians');
const Lemon = require('./middleware/lemon');
// const Webhook = require('./middleware/lemon');

app.use('/api/users', Users);
app.use('/api/frames', Frames);
app.use('/api/clients', Client);
app.use('/api/sales', Sales);
app.use('/api/expenses', Expenses);
app.use('/api/stocks', Stocks);
app.use('/api/subscriptions', Subscriptions);
app.use('/api/repairs', Repairs);
app.use('/api/appointments', Appointments);
app.use('/api/opticians', Opticians);
app.use('/api/lemon', Lemon);

// Utilisez express.raw pour la route de webhook
// app.post('/webhook', express.raw({ type: 'application/json' }), Webhook);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});