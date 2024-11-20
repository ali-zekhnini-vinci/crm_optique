const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { verifyTokenAndRole } = require('../middleware/auth');


router.get('/', async (req, res) => {
    console.log("Client");
    try {
        const client = await pool.query('SELECT * FROM clients');
        res.json(client.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

router.post('/AddClients', verifyTokenAndRole('Admin'), async (req, res) => {
    // Route protégée
    const { name, email, tel, status } = req.body;
    try {
        const newClient = await pool.query(
            'INSERT INTO clients (name, email, tel, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name.trim(), email.trim(), tel.trim(), status.trim()]
        );
        res.json(newClient.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
