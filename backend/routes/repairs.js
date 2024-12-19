const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


router.get('/', async (req, res) => {
    try {
      const repairs = await pool.query(`
        SELECT r.*, c.name AS client_name
        FROM repairs r
        JOIN clients c ON r.client_id = c.id
        ORDER BY created_at DESC 
        `);
      res.json(repairs.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des réparations', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  


router.get('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const repairs = await pool.query('SELECT * FROM repairs WHERE client_id = $1', [clientId]);
        res.json(repairs.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des réparations:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/AddRepair', async (req, res) => {
    const { user_id, equipment, estimated_completion_date, client_id, notes } = req.body;
    const status = 'En attente';
    console.log('user_id:', user_id);
    console.log('equipment:', equipment);
    console.log('status:', status);
    console.log('estimated_completion_date:', estimated_completion_date);
    console.log('client_id:', client_id);
    try {
        const newRepair = await pool.query(
            'INSERT INTO repairs (user_id, equipment, status, estimated_completion_date, client_id, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, equipment, status, estimated_completion_date, client_id, notes]
        );
        res.json(newRepair.rows[0]);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la réparation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.patch('/:repairId', async (req, res) => {
    const { repairId } = req.params;
    const { status, notes } = req.body;
    try {
        const updatedRepair = await pool.query('UPDATE repairs SET status = $1, notes = $3 WHERE id = $2 RETURNING *', [status, repairId, notes]);
        
        if (updatedRepair.rows.length === 0) {
            return res.status(404).json({ message: 'Réparation non trouvée' });
        }
        
        res.json(updatedRepair.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la modification de la réparation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});



module.exports = router;