const express = require('express');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});