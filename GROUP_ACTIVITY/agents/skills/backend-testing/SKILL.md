# Backend Testing Skill

Domain knowledge for writing API tests against the Employee Manager Express/SQLite backend.

## Application Context

| Item | Value |
|------|-------|
| Base URL | `http://localhost:4000` |
| Start command | `node server.js` (from `backend/`) |
| Database | SQLite (in-memory per process) |
| Test framework | Jest + Supertest |

## Endpoints Reference

| Method | Path | Request Body | Success | Error codes |
|--------|------|-------------|---------|-------------|
| `POST` | `/login` | `{ username, password }` | 200 `{ success: true, user: { username } }` | 400 (missing fields), 401 (bad creds) |
| `GET` | `/employees` | — | 200 `Employee[]` | — |
| `POST` | `/employees` | `{ name, email, position }` | 200 `Employee` | 400 (missing fields) |
| `PUT` | `/employees/:id` | `{ name, email, position }` | 200 `Employee` | 400 (missing), 404 (not found) |
| `DELETE` | `/employees/:id` | — | 200 `{ success: true }` | 404 (not found) |

## Response Schemas

```ts
// Employee
{ id: number; name: string; email: string; position: string }

// Login success
{ success: true; user: { username: string } }

// Login failure
{ success: false; error: "Invalid username or password" }

// Employee not found
{ error: "Employee not found" }

// Missing fields
{ error: "All fields are required" }  // or similar 400 message
```

## Valid Credentials

| Username | Password |
|----------|----------|
| `admin` | `password` |
| `user` | `123456` |
| `test` | `test123` |

## Reusable Helpers

```js
import supertest from 'supertest';

const request = supertest('http://localhost:4000');

async function createEmployee(data) {
  return request.post('/employees').send(data);
}

async function clearAllEmployees() {
  const res = await request.get('/employees');
  for (const emp of res.body) {
    await request.delete(`/employees/${emp.id}`);
  }
}
```

## Test Checklist per Endpoint

### POST /login
- [ ] 200 for each of the 3 valid user pairs
- [ ] Response body has `success: true` and `user.username`
- [ ] 401 for entirely wrong credentials
- [ ] 401 for correct username + wrong password
- [ ] 400 when username missing
- [ ] 400 when password missing
- [ ] 400 for empty body

### GET /employees
- [ ] 200 empty array after clearAll
- [ ] 200 with correct count after seeding
- [ ] Each record has `id`, `name`, `email`, `position`

### POST /employees
- [ ] 200 with `id` in response
- [ ] Created record appears in subsequent `GET /employees`
- [ ] 400 for each missing field (name, email, position)
- [ ] 400 for empty body

### PUT /employees/:id
- [ ] 200 with updated values in response
- [ ] Updated values persist in `GET /employees`
- [ ] 400 when any field missing
- [ ] 404 for non-existent id

### DELETE /employees/:id
- [ ] 200 + `success: true`
- [ ] Deleted record absent from `GET /employees`
- [ ] 404 for non-existent id

## Known Pitfalls

| Pitfall | Solution |
|---------|---------|
| Tests share database state | Call `clearAllEmployees()` in `beforeEach` |
| Non-existent id for 404 tests | Use a large id like `99999` that won't collide |
| `res.body.error` may vary by implementation | Check `res.status` first; only assert error string if stable |
