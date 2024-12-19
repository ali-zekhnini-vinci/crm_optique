const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Visualiser tous les stocks
router.get('/', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    console.log('id:', opticianId);
    try {
        const frames = await pool.query('SELECT * FROM frames WHERE optician_id = $1', [opticianId]);
        res.json(frames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter un stock
router.post('/stocks', async (req, res) => {
    const { frame_id, quantity } = req.body;
    try {
        const newStock = await pool.query(
            'INSERT INTO stocks (frame_id, quantity) VALUES ($1, $2) RETURNING *',
            [frame_id, quantity]
        );
        res.json(newStock.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Modifier un stock
router.put('/stocks/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const updatedStock = await pool.query(
            'UPDATE stocks SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, id]
        );
        res.json(updatedStock.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer un stock
router.delete('/stocks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM stocks WHERE id = $1', [id]);
        res.json({ msg: 'Stock deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


