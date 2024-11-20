const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Visualiser toutes les dépenses
router.get('/', async (req, res) => {
    try {
        const expenses = await pool.query('SELECT * FROM expenses');
        res.json(expenses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter une dépense
router.post('/addExpenses', async (req, res) => {
    const { description, amount } = req.body;
    try {
        const newExpense = await pool.query(
            'INSERT INTO expenses (description, amount) VALUES ($1, $2) RETURNING *',
            [description, amount]
        );
        res.json(newExpense.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Modifier une dépense
router.put('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount } = req.body;
    try {
        const updatedExpense = await pool.query(
            'UPDATE expenses SET description = $1, amount = $2 WHERE id = $3 RETURNING *',
            [description, amount, id]
        );
        res.json(updatedExpense.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer une dépense
router.delete('/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ msg: 'Expense deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


