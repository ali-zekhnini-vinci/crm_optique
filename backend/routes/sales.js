const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/', async (req, res) => {
    try {
        const sales = await pool.query('SELECT * FROM sales');
        console.log(sales.rows); // Ajoute cette ligne pour voir ce qui est renvoyé
        res.json(sales.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter une vente
router.post('/addSales', async (req, res) => {
    const { user_id, frame_id, quantity, total } = req.body;
    try {
        const newSale = await pool.query(
            'INSERT INTO sales (user_id, frame_id, quantity, total) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, frame_id, quantity, total]
        );
        res.json(newSale.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Visualiser la somme des ventes
router.get('/stats', async (req, res) => {
    try {
        const sales = await pool.query('SELECT SUM(total) AS total FROM sales');
        console.log(sales.rows.total_sales); // Ajoute cette ligne pour voir ce qui est renvoyé
        res.json(sales.rows[0].total);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

