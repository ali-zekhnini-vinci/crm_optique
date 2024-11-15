const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { redirect } = require('react-router-dom');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};



// Visualiser tous les users
app.get('/api/users', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM users');
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


const verifyTokenAndRole = (requiredRole) => (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
      }
      req.user = decoded.user; // Ajouter l'utilisateur décodé à la requête pour une utilisation ultérieure
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  };
  
  
  
  // Utiliser le middleware sur la route d'inscription
// Route d'inscription protégée
app.post('/api/register', verifyTokenAndRole('Admin'), async (req, res) => {
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
  
  // Exemple de route protégée
  app.use('/api/protected', verifyTokenAndRole('Admin'), (req, res) => {
    res.send({ message: 'Accès autorisé' });
  });
  
  



// CONNEXION
app.post('/api/login', async (req, res) => {
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
        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role.trim()
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Sending response:', { token, role: user.rows[0].role.trim() }); // Log the response
        res.json({ token, role: user.rows[0].role.trim() });       
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).send('Server Error');
    }
});


app.get('/api/check-admin', verifyTokenAndRole('Admin'), (req, res) => {
    res.json({ role: req.user.role });
  });
  
  

// Déconnexion
const blacklist = new Set(); // Initialisation d'une liste noire en mémoire (à adapter si vous souhaitez une persistance)

app.post('/api/logout', (req, res) => {
    console.log("LogOut");
    const token = req.headers['authorization']?.split(' ')[1]; // Récupérer le token depuis les headers
    console.log("token : " + token);
    if (token) {
        blacklist.add(token); // Ajouter le token à la liste noire
        res.status(200).send({ message: 'Déconnexion réussie' });
    } else {
        res.status(400).send({ message: 'Aucun token fourni' });
    }
});



////////////////////////////// MONTURE FUNCTIONS //////////////////////////

// Ajouter une monture
app.post('/api/frames', async (req, res) => {
    const { brand, model, price, stock, url } = req.body;
    console.log(req.body); // Ajoutez ceci pour vérifier les données
    try {
      const newFrame = await pool.query(
        'INSERT INTO frames (brand, model, price, stock, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [brand, model, price, stock, url]
      );
      res.json(newFrame.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

// Modifier une monture
app.put('/api/frames/:id', async (req, res) => {
    const { id } = req.params;
    const { brand, model, price, stock } = req.body;
    try {
        const updatedFrame = await pool.query(
            'UPDATE frames SET brand = $1, model = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
            [brand, model, price, stock, id]
        );
        res.json(updatedFrame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer une monture
app.delete('/api/frames/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM frames WHERE id = $1', [id]);
        res.json({ msg: 'Frame deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Visualiser toutes les montures
app.get('/api/frames', async (req, res) => {
    try {
        const frames = await pool.query('SELECT * FROM frames');
        res.json(frames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//////////////////////////////////// STOCK //////////////////////////////////

// Ajouter un stock
app.post('/api/stocks', async (req, res) => {
    const { frame_id, quantity } = req.body;
    try {
        const newStock = await pool.query(
            'INSERT INTO stocks (frame_id, quantity) VALUES ($1, $2) RETURNING *',
            [frame_id, quantity]
        );
        res.json(newStock.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Modifier un stock
app.put('/api/stocks/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const updatedStock = await pool.query(
            'UPDATE stocks SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, id]
        );
        res.json(updatedStock.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supprimer un stock
app.delete('/api/stocks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM stocks WHERE id = $1', [id]);
        res.json({ msg: 'Stock deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Visualiser tous les stocks
app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await pool.query('SELECT * FROM stocks');
        res.json(stocks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/////////////////////////////// VENTE ///////////////////////////////

// Ajouter une vente
app.post('/api/sales', async (req, res) => {
    const { user_id, frame_id, quantity, total } = req.body;
    try {
        const newSale = await pool.query(
            'INSERT INTO sales (user_id, frame_id, quantity, total) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, frame_id, quantity, total]
        );
        res.json(newSale.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Visualiser la somme des ventes
app.get('/api/sales', async (req, res) => {
    try {
        const sales = await pool.query('SELECT SUM(total) AS total FROM sales');
        console.log(sales.rows.total_sales); // Ajoute cette ligne pour voir ce qui est renvoyé
        res.json(sales.rows[0].total);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


////////////////////////////////// DEPENSES //////////////////////////////////

// Ajouter une dépense
app.post('/api/expenses', async (req, res) => {
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
app.put('/api/expenses/:id', async (req, res) => {
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
app.delete('/api/expenses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
        res.json({ msg: 'Expense deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Visualiser toutes les dépenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await pool.query('SELECT * FROM expenses');
        res.json(expenses.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



