const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { verifyTokenAndRole } = require('../middleware/auth');
const moment = require('moment-timezone');

// Get all clients
router.get('/', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    console.log("Fetching all clients");
    try {
        const clients = await pool.query('SELECT * FROM clients WHERE optician_id = $1', [opticianId]);
        res.json(clients.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Add a new client
router.post('/AddClients', /* verifyTokenAndRole('Admin'), */ async (req, res) => {
    const { name, email, phone, birth_date, address, city, postal_code, last_visit_date } = req.body;
    const opticianId = req.cookies.optician_id;
    try {
        const newClient = await pool.query(
            'INSERT INTO clients (name, email, phone, birth_date, address, city, postal_code, last_visit_date, optician_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name.trim(), email.trim(), phone.trim(), birth_date, address.trim(), city.trim(), postal_code.trim(), last_visit_date.trim(), opticianId.trim()]
        );
        res.json(newClient.rows[0]);
    } catch (err) {
        console.error('Error during client registration:', err.message);
        res.status(500).send('Server Error');
    }
});

// Update a client
// Route pour mettre à jour un client
router.put('/:id', verifyTokenAndRole('Admin'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, birth_date, address, city, postal_code, last_visit_date, notes } = req.body;

    try {
        const updatedClient = await pool.query(
            'UPDATE clients SET name = $1, email = $2, phone = $3, birth_date = $4, address = $5, city = $6, postal_code = $7, last_visit_date = $8, notes = $9 WHERE id = $10 RETURNING *',
            [name.trim(), email.trim(), phone.trim(), moment(birth_date).tz('UTC').format(), address.trim(), city.trim(), postal_code.trim(), moment(last_visit_date).tz('UTC').format(), notes, id]
        );

        if (updatedClient.rows.length === 0) {
            return res.status(404).json({ message: "Client non trouvé" });
        }
        res.json(updatedClient.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du client:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.get('/count', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    console.log('Get client count');
    try {
        const result = await pool.query('SELECT COUNT(*) AS count FROM clients WHERE optician_id = $1', [opticianId]); // Ajout d'un alias pour COUNT
        res.json(result.rows[0].count); // Convertir en entier et renvoyer
    } catch (err) {
        console.error('Erreur lors du comptage des clients:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// Get a specific client
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        if (client.rows.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        res.json(client.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la récupération des données du client:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const updatedClient = await pool.query(
            'UPDATE clients SET notes = $1 WHERE id = $2 RETURNING *',
            [notes, id]
        );

        if (updatedClient.rows.length === 0) {
            return res.status(404).json({ message: "Client non trouvé" });
        }

        res.json(updatedClient.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour des notes du client:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.post('/:id/prescriptions', async (req, res) => {
    const client_id = req.params.id;
    const {
        user_id, // Assurez-vous que cette valeur est valide
        date,
        right_sphere,
        right_cylinder,
        right_axis,
        left_sphere,
        left_cylinder,
        left_axis,
        add_power,
        notes
    } = req.body;

    try {
        // Vérifiez si user_id existe dans la table users
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ message: "L'utilisateur spécifié n'existe pas." });
        }

        const newPrescription = await pool.query(
            `INSERT INTO prescriptions 
            (client_id, user_id, date, right_sphere, right_cylinder, right_axis, 
            left_sphere, left_cylinder, left_axis, add_power, notes) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [client_id, user_id, date, right_sphere, right_cylinder, right_axis,
                left_sphere, left_cylinder, left_axis, add_power, notes]
        );

        res.status(201).json(newPrescription.rows[0]);
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la prescription:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.get('/:id/prescriptions', async (req, res) => {
    const { id } = req.params;
    try {
        const prescriptions = await pool.query(
            'SELECT * FROM prescriptions WHERE client_id = $1 ORDER BY date DESC',
            [id]
        );
        console.log(prescriptions.rows[0]);
        res.json(prescriptions.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des prescriptions:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.patch('/prescriptions/:id', async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const updatedPrescription = await pool.query(
            'UPDATE prescriptions SET notes = $1 WHERE id = $2 RETURNING *',
            [notes, id]
        );

        if (updatedPrescription.rows.length === 0) {
            return res.status(404).json({ message: "Prescription non trouvée" });
        }

        res.json(updatedPrescription.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour des notes de prescription:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.get('/:id/purchases', async (req, res) => {
    const clientId = req.params.id;
    try {
      const purchaseHistory = await pool.query(
        `SELECT s.id, s.sale_date, f.model as frame_model, s.quantity, s.total
         FROM sales s
         JOIN frames f ON s.frame_id = f.id
         WHERE s.client_id = $1
         ORDER BY s.sale_date DESC`,
        [clientId]
      );
      res.json(purchaseHistory.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur du serveur');
    }
  });

module.exports = router;