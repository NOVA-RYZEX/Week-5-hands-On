const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// SQLite database connection
const db = new sqlite3.Database("./expenseapi.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");

    // Create users table if not exists
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table created or already exists");
        }
      }
    );

    // Create expenses table if not exists
    db.run(
      `CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating expenses table:", err.message);
        } else {
          console.log("Expenses table created or already exists");
        }
      }
    );
  }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// POST /api/auth/register - User registration with password hashing
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const query = "INSERT INTO users (username, passwordHash) VALUES (?, ?)";
    db.run(query, [username, passwordHash], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "User registered successfully!" });
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login - User login with password hashing
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const query = "SELECT * FROM users WHERE username = ?";
  db.get(query, [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password with hashed password
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Authentication successful, generate and return token (JWT or session)
    res.json({ message: "Login successful!" });
  });
});

// POST /api/expenses - Add a new expense
app.post("/api/expenses", (req, res) => {
  const { userId, description, amount } = req.body;

  const query =
    "INSERT INTO expenses (userId, description, amount) VALUES (?, ?, ?)";
  db.run(query, [userId, description, amount], function (err) {
    if (err) {
      console.error("Error adding expense:", err.message);
      return res.status(500).json({ error: "Failed to add expense" });
    }

    console.log(`Expense added with ID: ${this.lastID}`);
    res.json({ message: "Expense added successfully!" });
  });
});

// GET /api/expenses - Retrieve all expenses
app.get("/api/expenses", (req, res) => {
  const query = "SELECT * FROM expenses";
  db.all(query, (err, expenses) => {
    if (err) {
      console.error("Error retrieving expenses:", err.message);
      return res.status(500).json({ error: "Failed to retrieve expenses" });
    }

    res.json(expenses);
  });
});

// PUT /api/expenses/:id - Update an existing expense
app.put("/api/expenses/:id", (req, res) => {
  const expenseId = req.params.id;
  const { description, amount } = req.body;

  const query = "UPDATE expenses SET description = ?, amount = ? WHERE id = ?";
  db.run(query, [description, amount, expenseId], function (err) {
    if (err) {
      console.error("Error updating expense:", err.message);
      return res.status(500).json({ error: "Failed to update expense" });
    }

    console.log(`Expense ${expenseId} updated successfully!`);
    res.json({ message: `Expense ${expenseId} updated successfully!` });
  });
});

// DELETE /api/expenses/:id - Delete an existing expense
app.delete("/api/expenses/:id", (req, res) => {
  const expenseId = req.params.id;

  const query = "DELETE FROM expenses WHERE id = ?";
  db.run(query, expenseId, function (err) {
    if (err) {
      console.error("Error deleting expense:", err.message);
      return res.status(500).json({ error: "Failed to delete expense" });
    }

    console.log(`Expense ${expenseId} deleted successfully!`);
    res.json({ message: `Expense ${expenseId} deleted successfully!` });
  });
});

// GET /api/expense - Calculate total expense for a user
app.get("/api/expense", (req, res) => {
  const query = "SELECT SUM(amount) AS totalExpense FROM expenses";
  db.get(query, (err, result) => {
    if (err) {
      console.error("Error calculating total expense:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to calculate total expense" });
    }

    const totalExpense = result.totalExpense || 0;
    res.json({ totalExpense });
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Expense Tracker API!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
