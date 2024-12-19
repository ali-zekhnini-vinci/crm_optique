const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Visualiser toutes les montures
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

// Ajouter une monture
router.post('/AddFrames', async (req, res) => {
    const { brand, model, color, size, material, price, cost, stock, image, category, type } = req.body;
    const opticianId = req.cookies.optician_id;

    if (!image || !image.startsWith('data:image/')) {
      return res.status(400).send('Format d\'image invalide ou champ manquant');
    }
  
    try {
      const newFrame = await pool.query(
        'INSERT INTO frames (brand, model, color, size, material, price, cost, stock, image, category, optician_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [brand, model, color, size, material, price, cost, stock, image, category, opticianId]
      );
      res.json(newFrame.rows[0]);
    } catch (err) {
      console.error('Erreur lors de l\'ajout :', err.message);
      res.status(500).send('Erreur serveur');
    }
});

// Modifier une monture
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { brand, model, color, size, material, price, cost, stock, image } = req.body;
    try {
        const updatedFrame = await pool.query(
            'UPDATE frames SET brand = $1, model = $2, color = $3, size = $4, material = $5, price = $6, cost = $7, stock = $8, image = $9 WHERE id = $10 RETURNING *',
            [brand, model, color, size, material, price, cost, stock, image, id]
        );
        res.json(updatedFrame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer une monture
router.delete('/:id', async (req, res) => {
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