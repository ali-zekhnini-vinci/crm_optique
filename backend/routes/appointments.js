const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const moment = require('moment-timezone');

// Route GET pour récupérer les rendez-vous
router.get('/', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    try {
        const response = await pool.query(
            `SELECT a.date, a.type, a.notes, a.status, a.appointment_time AS time, a.client_id, c.name, c.phone, c.email
                FROM appointments a
                JOIN clients c ON a.client_id = c.id
                WHERE a.optician_id = $1
            `,
            [opticianId]
        );
        res.json(response.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous :', error.message);
        res.status(500).send('Server Error');
    }
});

// Route POST pour ajouter un rendez-vous
router.post('/addAppointment', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    const { estimated_completion_date, type, client_id, status, notes, appointment_time } = req.body;
    try {
        const response = await pool.query(
            'INSERT INTO appointments (date, type, status, appointment_time, optician_id, notes, client_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [estimated_completion_date, type, status, appointment_time, opticianId, notes, client_id]
        );
        res.json(response.rows[0]);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du rendez-vous :', error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
