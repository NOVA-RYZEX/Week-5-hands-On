# Expense Tracker API

```shell
npm install express bcrypt sqlite3
npm run start
```

## API Endpoints

1. User Registration (POST /api/auth/register)

```shell
curl -X POST -H "Content-Type: application/json" -d '{"username":"john_doe","password":"securePassword"}' http://localhost:3000/api/auth/register
```

2. User Login (POST /api/auth/login)

```shell
curl -X POST -H "Content-Type: application/json" -d '{"username":"john_doe","password":"securePassword"}' http://localhost:3000/api/auth/login
```

3. Get All Expenses (GET /api/expenses)

```shell
curl http://localhost:3000/api/expenses
```

4. Add New Expense (POST /api/expenses)

```shell
curl -X POST -H "Content-Type: application/json" -d '{"description":"Groceries","amount":50}' http://localhost:3000/api/expenses
```

5. Update Expense (PUT /api/expenses/:id)

```shell
curl -X PUT -H "Content-Type: application/json" -d '{"description":"Updated Groceries","amount":60}' http://localhost:3000/api/expenses/1
```

6. Delete Expense (DELETE /api/expenses/:id)

```shell
curl -X DELETE http://localhost:3000/api/expenses/1
```

7. Calculate Total Expense (GET /api/expense)

```shell
curl http://localhost:3000/api/expense
```
