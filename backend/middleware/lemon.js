const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { sendEmail } = require('./mailer');

dotenv.config();

// Configuration de l'API Lemon Squeezy
const LEMON_API_BASE_URL = 'https://api.lemonsqueezy.com/v1';
const LEMON_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const LEMON_STORE_ID = process.env.LEMON_STORE;

// Middleware pour ajouter l'en-tête d'authentification
const lemonAuth = {
    headers: {
        Authorization: `Bearer ${LEMON_API_KEY}`,
        Accept: 'application/json'
    }
};

// GET route for products
router.get('/products', async (req, res) => {
    try {
        const response = await axios.get(`${LEMON_API_BASE_URL}/products?filter[store_id]=${LEMON_STORE_ID}`, lemonAuth);
        res.json(response.data.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error.message);
        res.status(500).send('Erreur serveur lors de la récupération des produits');
    }
});

// POST route for handling webhooks
router.post('/', async (req, res) => {
    const event = req.body; // The incoming webhook 

    if (!event) {
        return res.status(400).send('No event data received');
    }

    // Log the event for debugging
    console.log('Webhook event received:', event);

    // Handle specific events
    if (event.meta.event_name === 'subscription_payment_success') {
        // Process the subscription payment success event
        try {
            const subscriptionId = event.data.attributes.subscription_id;

            // Fetch subscription details to get product_name
            const subscriptionResponse = await axios.get(`${LEMON_API_BASE_URL}/subscriptions/${subscriptionId}`, lemonAuth);
            const subscriptionData = subscriptionResponse.data.data;
            const subscriptionStatus = subscriptionData.attributes.product_name;

            console.log('subscriptionStatus : ' + subscriptionStatus);

            const { id, attributes } = event.data;
            const email = attributes.user_email;
            const name = attributes.user_name;
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 12);

            console.log('password : ' + generatedPassword);

            // Check if the optician already exists
            const existingOptician = await pool.query('SELECT * FROM opticians WHERE email = $1', [email]);
            const planId = await pool.query('SELECT id FROM subscription_plans WHERE name = $1', [subscriptionStatus]);

            if (existingOptician.rows.length > 0) {
                // Optician exists, do not accept the payment
                console.log('Optician already exists with ID:', existingOptician.rows[0].id);
                return res.status(400).send('Optician already exists. Payment cannot be accepted.');
            } else {
                // Optician does not exist, create a new optician
                const registerOptician = await pool.query('INSERT INTO opticians (name, email, subscription_status) VALUES ($1, $2, $3) RETURNING *', [name, email, subscriptionStatus]);
                const opticianId = registerOptician.rows[0].id;
                console.log('New optician created with ID:', opticianId);

                // Create user associated with the optician
                const registerUser = await pool.query('INSERT INTO users (username, email, password, role, optician_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, email, hashedPassword, 'Admin', opticianId]);

                // Create subscription associated with the optician
                const registerSubscription = await pool.query(
                    'INSERT INTO subscriptions (optician_id, start_date, end_date, status, created_at, plan_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [
                        opticianId,
                        subscriptionData.attributes.created_at,
                        subscriptionData.attributes.renews_at,
                        subscriptionData.attributes.status_formatted,
                        new Date(),
                        planId.rows[0].id,
                    ]
                );

                try {
                    await sendEmail(
                        email,
                        'Bienvenue sur CRM Optique - Votre mot de passe temporaire',
                        `<h1>Bienvenue sur CRM Optique, ${name}!</h1>
                        <p>Votre compte a été créé avec succès. Voici votre mot de passe temporaire :</p>
                        <p><strong>${generatedPassword}</strong></p>
                        <p>Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.</p>
                        <p>Vous pouvez vous connecter ici : <a href="https://crm-optique.com/login">https://crm-optique.com/login</a></p>`,
                        `Bienvenue sur CRM Optique, ${name}!
                        Votre compte a été créé avec succès. Voici votre mot de passe temporaire : ${generatedPassword}
                        Pour des raisons de sécurité, veuillez changer ce mot de passe dès votre première connexion.
                        Vous pouvez vous connecter ici : https://crm-optique.com/login`
                    );      
                } catch (error) {
                    console.error('Erreur lors de l\'envoi de l\'email de bienvenue :', error.message);
                    return res.status(500).send('Erreur serveur lors de l\'envoi de l\'email de bienvenue');
                }

                console.log('registerSubscription : ' + registerSubscription.rows[0].id);
                console.log('registerUser : ' + registerUser.rows[0].id);
                console.log('password : ' + generatedPassword);

                // You can insert logic here to handle the successful payment, e.g., updating your database
                console.log(`Payment successful for subscription ID: ${id}, Amount: ${attributes.total_formatted}`);
                // Respond with a 200 status to acknowledge receipt of the event
                return res.status(200).send('Event received');
            }

        } catch (error) {
            console.error('Erreur lors de la gestion de l\'événement de paiement de l\'abonnement :', error.message);
            return res.status(500).send('Erreur serveur lors de la gestion de l\'événement de paiement de l\'abonnement');
        }
    }

    // If the event type is not recognized, respond with a 200 status
    return res.status(200).send('Event type not handled');
});

module.exports = router;