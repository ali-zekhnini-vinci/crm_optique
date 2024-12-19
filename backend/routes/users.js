const express = require('express');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');
const { Pool } = require('pg');
const { verifyTokenAndRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Configurez Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Afficher tous les utilisateurs
router.get('/', verifyTokenAndRole('Admin'), async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const id = req.cookies.optician_id;
    try {
        const users = await pool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE optician_id = $1 LIMIT $2 OFFSET $3',
            [id, limit, (page - 1) * limit]
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Ajouter un utilisateur (Admin uniquement)
router.post('/register', async (req, res) => {
    const { username, email, password, role, phone_number } = req.body;
    const id = req.cookies.optician_id
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, role, optician_id, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, created_at, optician_id, phone_number',
            [username, email, hashedPassword, role, id, phone_number]
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
    console.log('Received data:', { username, password });

    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Username Incorrect' });
        }
        console.log('User found:', user.rows[0]);

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mot De Passe incorrect' });
        }

        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role,
                optician_id: user.rows[0].optician_id
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const role = user.rows[0].role;
        const optician_id = user.rows[0].optician_id;
        const id = user.rows[0].id;

        if (user.rows[0].two_factor_enabled) {
            // Générer un code de vérification
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Envoyer le code par SMS via Twilio
            try {
                await twilioClient.messages.create({
                    body: `Votre code de vérification est : ${verificationCode}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.rows[0].phone_number // Assurez-vous que ce champ existe dans votre table users
                });

                // Stocker le code de vérification dans la base de données
                await pool.query('UPDATE users SET verification_code = $1 WHERE id = $2', [verificationCode, user.rows[0].id]);

                // Envoyer une réponse indiquant que le code a été envoyé
                res.json({ msg: 'Code de vérification envoyé', userId: user.rows[0].id, two_factor_enabled: true });
            } catch (twilioError) {
                console.error('Erreur Twilio:', twilioError);
                res.status(500).json({ msg: 'Erreur lors de l\'envoi du SMS' });
            }
        } else {
            res
                .cookie('access_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .cookie('role', role, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .cookie('optician_id', optician_id, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .json({ role, token, optician_id, id });
        }
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
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.clearCookie('optician_id', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Déconnexion réussie' });
});


// Route pour activer la 2FA
router.post('/2fa/enable', async (req, res) => {
    const { userId, phoneNumber } = req.body; // Récupérez l'ID utilisateur et le numéro de téléphone

    try {
        // Générer un code de vérification aléatoire
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Envoyer le code par SMS
        await twilioClient.messages.create({
            body: `Votre code de vérification est : ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER, // Votre numéro Twilio
            to: phoneNumber,
        });

        // Enregistrez le code dans la base de données
        await pool.query('UPDATE users SET verification_code = $1 WHERE id = $2', [verificationCode, userId]);

        res.send('Code de vérification envoyé avec succès');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur lors de l\'envoi du code de vérification');
    }
});

router.get('/sms-auth/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [userId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur lors de la récupération des informations utilisateur');

    }
});

// Nouvelle route pour vérifier le code
router.post('/verify-code', async (req, res) => {
    const { userId, code } = req.body;
    console.log(`Verification code: ${code}`);
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1 AND verification_code = $2', [userId, code]);

        if (result.rows.length > 0) {
            console.log('Code de vérification correct');
            const user = result.rows[0];
            const payload = {
                user: {
                    id: user.id,
                    role: user.role,
                    optician_id: user.optician_id
                }
            };

            console.log('User found:', payload);

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            const role = user.role;
            const optician_id = user.optician_id;
            const id = user.id;

            console.log('Token:', token);
            console.log('Role:', role);

            res
                .cookie('access_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .cookie('role', user.role, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .cookie('optician_id', user.optician_id, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 3600000,
                })
                .status(200)
                .json({ role /*, token */, optician_id, id });
        } else {
            res.status(400).json({ msg: 'Code de vérification invalide' });
        }
    } catch (err) {
        console.error('Error during code verification:', err.message);
        res.status(500).send('Server Error');
    }
});

// Route pour désactiver la 2FA
router.post('/2fa/disable', async (req, res) => {
    const { userId } = req.body;

    try {
        await pool.query('UPDATE users SET two_factor_enabled = false WHERE id = $1', [userId]);
        res.send('Authentification à deux facteurs désactivée avec succès');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur lors de la désactivation de la 2FA');
    }
});

router.post('/update-sms-auth', async (req, res) => {
    const { two_factor_enabled, user_id } = req.body;

    try {
        await pool.query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [two_factor_enabled, user_id]);
        res.send('Authentification à deux facteurs activée avec succès');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erreur lors de l\'activation de la 2FA');
    }
});


router.get('/widgets', async (req, res) => {
    try {
        const widgets = await pool.query('SELECT * FROM widgets');
        res.json(widgets.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des préférences de widgets:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/user-widget-preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const preferences = await pool.query(`
            SELECT uwp.*, w.widget_title, w.description
            FROM user_widget_preferences uwp
            JOIN widgets w ON uwp.widget_id = w.id
            WHERE uwp.user_id = $1
        `, [userId]);
        res.json(preferences.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des préférences de widgets:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


router.put('/user-widget-preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    const { widgetId, enabled } = req.body;
    console.log(widgetId, enabled);
    try {
        await pool.query(
            'UPDATE user_widget_preferences SET enabled = $3 WHERE user_id = $1 AND widget_id = $2',
            [userId, widgetId, enabled]
        );
        res.json({ message: 'Préférences de widget mises à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des préférences de widget:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/updateUser/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, phone_number } = req.body;
        const newUser = await pool.query(
            'UPDATE users SET username = $1, email = $2,  phone_number = $3 WHERE id = $4 RETURNING id, username, email, role, created_at, optician_id, phone_number',
            [username, email, phone_number, userId]
        );
        res.json(newUser.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des préférences de widget:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
})





module.exports = router;