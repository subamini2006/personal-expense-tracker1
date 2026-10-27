const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10
});

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  const { title, amount, category, date, payment_method } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO expenses (title, amount, category, date, payment_method) VALUES (?, ?, ?, ?, ?)',
      [title, amount, category, date, payment_method || 'UPI']
    );
    res.status(201).json({ id: result.insertId, title, amount, category, date, payment_method });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, payment_method } = req.body;
  try {
    await pool.query(
      'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, payment_method = ? WHERE id = ?',
      [title, amount, category, date, payment_method, id]
    );
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;