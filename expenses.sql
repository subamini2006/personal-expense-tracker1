CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed comprehensive sample data
INSERT INTO expenses (title, amount, category, date, payment_method) VALUES
('Food & Groceries', 150.00, 'Food', CURDATE(), 'UPI'),
('Metro Transport Pass', 80.00, 'Transport', CURDATE(), 'Card'),
('Shopping & Clothes', 500.00, 'Shopping', CURDATE(), 'Credit Card'),
('Online Course Subscription', 300.00, 'Education', CURDATE(), 'Net Banking'),
('Movie & Snacks', 200.00, 'Entertainment', CURDATE(), 'Cash'),
('Electricity & Water Bill', 450.00, 'Utilities', CURDATE(), 'UPI');