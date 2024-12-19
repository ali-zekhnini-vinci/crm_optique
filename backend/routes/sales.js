const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// Récupérer toutes les ventes
router.get('/', async (req, res) => {
    try {
        const sales = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
        res.json(sales.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Ajouter une vente
router.post('/addSales', async (req, res) => {
    const { user_id, frame_id, quantity, total, sale_date, client_id } = req.body;
    const opticianId = req.cookies.optician_id;
    
    try {
        // Commencer une transaction
        await pool.query('BEGIN');

        // Insérer la nouvelle vente
        const newSale = await pool.query(
            'INSERT INTO sales (user_id, frame_id, quantity, total, sale_date, client_id, optician_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, frame_id, quantity, total, sale_date || new Date(), client_id, opticianId]
        );

        // Insérer dans sale_items
        await pool.query(
            'INSERT INTO sale_items (sale_id, frame_id, quantity, price, optician_id) VALUES ($1, $2, $3, $4, $5)',
            [newSale.rows[0].id, frame_id, quantity, total / quantity, opticianId]
        );

        // Mettre à jour le stock de la monture
        const updateStock = await pool.query(
            'UPDATE frames SET stock = stock - $1 WHERE id = $2 RETURNING stock',
            [quantity, frame_id]
        );

        // Vérifier si le stock est suffisant
        if (updateStock.rows[0].stock < 0) {
            throw new Error('Stock insuffisant');
        }

        // Valider la transaction
        await pool.query('COMMIT');

        res.json(newSale.rows[0]);
    } catch (err) {
        // En cas d'erreur, annuler la transaction
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send(err.message === 'Stock insuffisant' ? 'Stock insuffisant' : 'Server Error');
    }
});

router.post('/create-checkout-session', async (req, res) => {
    const { items } = req.body;
    const { id } = '2';
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.model,
            },
            unit_amount: item.price * 100, // Montant en centimes
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `http://localhost:3000/clients/${id}`,
        cancel_url: 'http://localhost:3000/cancel',
      });
  
      res.json({ id: session.id });
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la session' });
    }
  });

// Visualiser la somme des ventes avec filtrage par date
router.get('/stats', async (req, res) => {
    const { startDate, endDate } = req.query;
    const opticianId = req.cookies.optician_id;
    try {
        let query = 'SELECT SUM(total) AS total FROM sales WHERE optician_id = ' + opticianId;
        const queryParams = [];

        if (startDate && endDate) {
            query += ' AND (sale_date BETWEEN $1 AND $2) ';
            queryParams.push(startDate, endDate);
        }

        const sales = await pool.query(query, queryParams);
        res.json(sales.rows[0].total);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Obtenir les produits les plus vendus
router.get('/top-products', async (req, res) => {
    const opticianId = req.cookies.optician_id;
    try {
        const result = await pool.query(`
            SELECT fi.frame_id, f.brand, f.model, SUM(fi.quantity) AS total_quantity, SUM(fi.price * fi.quantity) AS total_sales
            FROM sale_items fi
            JOIN frames f ON fi.frame_id = f.id
            WHERE f.optician_id = $1
            GROUP BY fi.frame_id, f.brand, f.model, fi.price
            ORDER BY total_quantity DESC
            LIMIT 10
        `, [opticianId]);
        console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des produits les plus vendus:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

// Obtenir les ventes par catégorie
router.get('/by-category', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.category, SUM(si.price * si.quantity) AS Ventes
            FROM sale_items si
            JOIN frames f ON si.frame_id = f.id
            GROUP BY f.category
        `);
        console.log('Données des ventes par catégorie:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des ventes par catégorie:', err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.post('/sale-items', async (req, res) => {
    const { sale_id, frame_id, quantity, price } = req.body;
    const opticianId = req.cookies.optician_id
    try {
        const newSaleItem = await pool.query(
            'INSERT INTO sale_items (sale_id, frame_id, quantity, price, oprician_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [sale_id, frame_id, quantity, price, opticianId]
        );
        res.status(201).json(newSaleItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur du serveur');
    }
});

router.get('/monthly-sales', async (req, res) => {
    const { startDate, endDate } = req.query;
    const opticianId = req.cookies.optician_id;
    try {
        let query = `
            SELECT 
                TO_CHAR(sale_date, 'YYYY-MM') AS month,
                SUM(total) AS sales
            FROM sales
            WHERE (sale_date BETWEEN $1 AND $2) AND optician_id = $3
            GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
            ORDER BY month, sales
        `;
        const queryParams = [startDate || '2000-01-01', endDate || '2099-12-31', opticianId];

        const sales = await pool.query(query, queryParams);
        res.json({ monthlySales: sales.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;