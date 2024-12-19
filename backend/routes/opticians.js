const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    const { email, subscription_status, username, password, phone_number, company } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: subscription_status,
                    },
                    unit_amount: subscription_status === 'basic' ? 1000 : subscription_status === 'standard' ? 2000 : 3000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,            
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                username,
                email,
                subscription_status,
                phone_number,
                company
            }
        });

        res.json({ sessionId: session.id });
    } catch (err) {
        console.error('Erreur lors de la création de la session de paiement :', err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;