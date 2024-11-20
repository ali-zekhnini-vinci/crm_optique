const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { verifyTokenAndRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Afficher tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter un utilisateur (Admin uniquement)
router.post('/register', verifyTokenAndRole('Admin'), async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const trimmedUsername = username.trim();
        const trimmedRole = role.trim();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
            [trimmedUsername, hashedPassword, trimmedRole]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(500).send('Server Error');
    }
});

// CONNEXION
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received data:', { username, password }); // Log the received data

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Username Incorrect' });
        }
        console.log('User found:', user.rows[0]); // Log the user found

        const isMatch = await bcrypt.compare(password, user.rows[0].password.trim());
        console.log('Password match:', isMatch); // Log the result of password comparison
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mot De Passe incorrect' });
        }

        // Créer le payload pour le token
        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role.trim()
            }
        };

        // Générer le token JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const role = user.rows[0].role.trim(); // Récupérer le rôle

        // Envoyer le token et le rôle comme cookies sécurisés
        res
            .cookie('access_token', token, {
                httpOnly: true, // Le cookie ne peut pas être accédé via JavaScript
                secure: process.env.NODE_ENV === 'production', // Activé uniquement en HTTPS en production
                sameSite: 'Strict', // Empêche l'envoi des cookies vers d'autres domaines
                maxAge: 3600000, // Expiration : 1 heure (en ms)
            })
            .cookie('role', role, {
                httpOnly: false, // Le rôle peut être accédé côté client si nécessaire
                secure: process.env.NODE_ENV === 'production', // Activé uniquement en HTTPS en production
                sameSite: 'Strict', // Empêche l'envoi des cookies vers d'autres domaines
                maxAge: 3600000, // Expiration : 1 heure (en ms)
            })
            .json({ role, token }); // Retourner aussi le rôle et le token dans la réponse JSON pour des besoins frontend
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/check-admin', (req, res) => {
    console.log('Checking');
    console.log('role : ' + req.cookies.role)
    res.json({ role: req.cookies.role });
});

router.post('/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.clearCookie('role', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Déconnexion réussie' });
});

module.exports = router;
