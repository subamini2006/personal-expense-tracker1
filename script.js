const API_URL = 'http://localhost:5000/api/expenses';

// DOM Elements
const form = document.getElementById('expense-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const paymentMethodInput = document.getElementById('payment_method');
const expenseIdInput = document.getElementById('expense-id');

const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const expenseList = document.getElementById('expense-list');
const totalExpenseEl = document.getElementById('total-expense');
const categoryBreakdown = document.getElementById('category-breakdown');
const analyticsBreakdown = document.getElementById('analytics-breakdown');

const statCount = document.getElementById('stat-count');
const statTopCat = document.getElementById('stat-top-cat');
const statMaxExp = document.getElementById('stat-max-exp');

const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const budgetProgress = document.getElementById('budget-progress');
const budgetText = document.getElementById('budget-text');

let expensesData = [];
const MONTHLY_BUDGET = 10000;

dateInput.value = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', fetchExpenses);

// Navigation Switch Functionality
function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-tab'));

  document.getElementById(`nav-${tabName}`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active-tab');

  const titleEl = document.getElementById('page-title');
  const subtitleEl = document.getElementById('page-subtitle');

  if (tabName === 'dashboard') {
    titleEl.innerText = 'Overview Dashboard';
    subtitleEl.innerText = 'Monitor, analyze, and manage your daily expenses seamlessly.';
  } else if (tabName === 'analytics') {
    titleEl.innerText = 'Analytics & Insights';
    subtitleEl.innerText = 'Deep dive into your spending patterns and category limits.';
  } else if (tabName === 'history') {
    titleEl.innerText = 'Transactions & History';
    subtitleEl.innerText = 'Search, filter, and review all previous expense records.';
  }
}

async function fetchExpenses() {
  try {
    const res = await fetch(API_URL);
    expensesData = await res.json();
    renderExpenses();
    renderCategoryBreakdown();
    renderStats();
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
}

function renderExpenses() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;
  const selectedMonth = filterMonth.value;

  const filtered = expensesData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    let matchesMonth = true;
    if (selectedMonth) {
      matchesMonth = item.date.substring(0, 7) === selectedMonth;
    }
    return matchesSearch && matchesCategory && matchesMonth;
  });

  expenseList.innerHTML = '';
  let total = 0;

  filtered.forEach(item => {
    total += parseFloat(item.amount);
    const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td><span class="badge">${item.category}</span></td>
      <td style="color:#c084fc;">${item.payment_method || 'UPI'}</td>
      <td>${formattedDate}</td>
      <td style="font-weight: 700; color: #e9d5ff;">₹${parseFloat(item.amount).toFixed(2)}</td>
      <td class="actions-cell">
        <button class="action-btn" onclick="editExpense(${item.id})">✏️</button>
        <button class="action-btn" onclick="deleteExpense(${item.id})">🗑️</button>
      </td>
    `;
    expenseList.appendChild(row);
  });

  totalExpenseEl.innerText = `₹${total.toFixed(2)}`;

  // Update Progress Widget
  const pct = Math.min((total / MONTHLY_BUDGET) * 100, 100);
  if (budgetProgress) budgetProgress.style.width = `${pct}%`;
  if (budgetText) budgetText.innerText = `₹${total.toFixed(0)} / ₹${MONTHLY_BUDGET} used`;
}

function renderCategoryBreakdown() {
  const totals = {};
  let grandTotal = 0;

  expensesData.forEach(exp => {
    const amt = parseFloat(exp.amount);
    totals[exp.category] = (totals[exp.category] || 0) + amt;
    grandTotal += amt;
  });

  const generateHTML = () => {
    return Object.keys(totals).map(cat => {
      const catTotal = totals[cat];
      const pct = grandTotal > 0 ? ((catTotal / grandTotal) * 100).toFixed(0) : 0;
      return `
        <div class="cat-item">
          <div class="cat-item-header">
            <span>${cat}</span>
            <span>₹${catTotal.toFixed(2)} (${pct}%)</span>
          </div>
          <div class="cat-bar">
            <div class="cat-progress" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  };

  categoryBreakdown.innerHTML = generateHTML();
  analyticsBreakdown.innerHTML = generateHTML();
}

function renderStats() {
  statCount.innerText = `${expensesData.length} Items`;
  
  if (expensesData.length === 0) {
    statTopCat.innerText = 'None';
    statMaxExp.innerText = '₹0.00';
    return;
  }

  // Top Category Calculation
  const catCounts = {};
  let maxAmt = 0;

  expensesData.forEach(exp => {
    const amt = parseFloat(exp.amount);
    catCounts[exp.category] = (catCounts[exp.category] || 0) + amt;
    if (amt > maxAmt) maxAmt = amt;
  });

  const topCategory = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b, 'None');

  statTopCat.innerText = topCategory;
  statMaxExp.innerText = `₹${maxAmt.toFixed(2)}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: titleInput.value,
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
    payment_method: paymentMethodInput.value
  };

  const id = expenseIdInput.value;

  try {
    if (id) {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    resetForm();
    fetchExpenses();
  } catch (error) {
    console.error('Error saving expense:', error);
  }
});

function editExpense(id) {
  const item = expensesData.find(exp => exp.id === id);
  if (!item) return;

  switchTab('dashboard');

  expenseIdInput.value = item.id;
  titleInput.value = item.title;
  amountInput.value = item.amount;
  categoryInput.value = item.category;
  dateInput.value = item.date.split('T')[0];
  paymentMethodInput.value = item.payment_method || 'UPI';

  formTitle.innerText = 'Edit Expense';
  submitBtn.innerText = 'Update Expense';
  cancelBtn.style.display = 'block';
}

function resetForm() {
  form.reset();
  expenseIdInput.value = '';
  formTitle.innerText = 'Add New Expense';
  submitBtn.innerText = 'Add Expense';
  cancelBtn.style.display = 'none';
  dateInput.value = new Date().toISOString().split('T')[0];
}

cancelBtn.addEventListener('click', resetForm);

async function deleteExpense(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }
}

searchInput.addEventListener('input', renderExpenses);
filterCategory.addEventListener('change', renderExpenses);
filterMonth.addEventListener('change', renderExpenses);