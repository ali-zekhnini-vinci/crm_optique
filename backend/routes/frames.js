const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


// Visualiser toutes les montures
router.get('/', async (req, res) => {
    try {
        const frames = await pool.query('SELECT * FROM frames');
        res.json(frames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter une monture
router.post('/frames', async (req, res) => {
    const { brand, model, price, stock, url } = req.body;
    console.log(req.body); // Ajoutez ceci pour vérifier les données
    try {
        const newFrame = await pool.query(
            'INSERT INTO frames (brand, model, price, stock, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [brand, model, price, stock, url]
        );
        res.json(newFrame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Modifier une monture
router.put('/frames/:id', async (req, res) => {
    const { id } = req.params;
    const { brand, model, price, stock } = req.body;
    try {
        const updatedFrame = await pool.query(
            'UPDATE frames SET brand = $1, model = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
            [brand, model, price, stock, id]
        );
        res.json(updatedFrame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer une monture
router.delete('/frames/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM frames WHERE id = $1', [id]);
        res.json({ msg: 'Frame deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
