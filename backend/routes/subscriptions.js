const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const stripe = require('stripe')('sk_test_51QTTmrQMnVYA3nqw3hUxYPgyOeyCLzKqi6uUGelrLYFqnZbGGrb4zyobc8P8JBH906h0xPKAKNjh4nmgDl8RoChb00AW5HetkD');


// Route pour récupérer les abonnements d'un opticien
router.get('/:opticianId', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    try {
        const result = await pool.query('SELECT * FROM subscriptions WHERE optician_id = $1', [opticianId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/plan/:opticianId', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    console.log('opticianId ' + opticianId);
    try {
        const result = await pool.query(`
            SELECT sp.id, sp.name, sp.price, s.status, s.id AS subscription_id
            FROM subscription_plans sp
            JOIN subscriptions s ON sp.id = s.plan_id
            WHERE optician_id = $1
            `, 
            [opticianId]);
            console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/change', async (req, res) => {
    const { subscriptionId, planId } = req.body; // Assurez-vous que ces valeurs sont passées dans le corps de la requête
    console.log('sub' + subscriptionId);
    console.log('plan' + planId);
    const price = 10; // Remplacez par le prix du plan

    try {
        // Créer une session de paiement avec Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: planId,
                        },
                        unit_amount: price * 100, // Montant en centimes
                    }, // Utilisez l'ID du prix ici
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'http://localhost:3000/success', // Remplacez par votre URL de succès
            cancel_url: 'http://localhost:3000/cancel', // Remplacez par votre URL d'annulation
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        res.status(500).send('Erreur lors du changement de plan');
    }
});

// Route pour changer le plan d'abonnement
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { planId } = req.body; // Assurez-vous que le plan_id est passé dans le corps de la requête
    try {
        await pool.query('UPDATE subscriptions SET plan_id = $1 WHERE id = $2', [planId, id]);
        res.send('Abonnement mis à jour avec succès');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Route pour annuler un abonnement
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM subscriptions WHERE id = $1', [id]);
        res.send('Abonnement annulé avec succès');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;