import supertest from 'supertest';

const API_URL = 'http://localhost:4000';
const request = supertest(API_URL);

/** Create one employee and return the response. */
async function createEmployee(data) {
  return request.post('/employees').send(data);
}

/** Delete all employees to provide a clean slate. */
async function clearAllEmployees() {
  const res = await request.get('/employees');
  for (const emp of res.body) {
    await request.delete(`/employees/${emp.id}`);
  }
}

// ─── POST /login ──────────────────────────────────────────────────────────────

describe('POST /login', () => {
  test('returns 200 and success:true for admin/password', async () => {
    const res = await request.post('/login').send({ username: 'admin', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('admin');
  });

  test('returns 200 for user/123456', async () => {
    const res = await request.post('/login').send({ username: 'user', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('returns 200 for test/test123', async () => {
    const res = await request.post('/login').send({ username: 'test', password: 'test123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('returns 401 with error message for entirely invalid credentials', async () => {
    const res = await request.post('/login').send({ username: 'ghost', password: 'boo' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid username or password');
  });

  test('returns 401 when correct username but wrong password', async () => {
    const res = await request.post('/login').send({ username: 'admin', password: 'notmypassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when username is missing', async () => {
    const res = await request.post('/login').send({ password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request.post('/login').send({ username: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when body is empty', async () => {
    const res = await request.post('/login').send({});
    expect(res.status).toBe(400);
  });
});

// ─── GET /employees ───────────────────────────────────────────────────────────

describe('GET /employees', () => {
  beforeEach(clearAllEmployees);

  test('returns 200 with empty array when no employees exist', async () => {
    const res = await request.get('/employees');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all created employees', async () => {
    await createEmployee({ name: 'Alice', email: 'alice@test.com', position: 'Dev' });
    await createEmployee({ name: 'Bob', email: 'bob@test.com', position: 'QA' });
    const res = await request.get('/employees');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('each employee record contains id, name, email, position', async () => {
    await createEmployee({ name: 'Carol', email: 'carol@test.com', position: 'PM' });
    const res = await request.get('/employees');
    const emp = res.body[0];
    expect(emp).toHaveProperty('id');
    expect(emp).toHaveProperty('name', 'Carol');
    expect(emp).toHaveProperty('email', 'carol@test.com');
    expect(emp).toHaveProperty('position', 'PM');
  });
});

// ─── POST /employees ──────────────────────────────────────────────────────────

describe('POST /employees', () => {
  beforeEach(clearAllEmployees);

  test('creates employee and returns record with id', async () => {
    const res = await createEmployee({ name: 'John', email: 'john@test.com', position: 'Developer' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('John');
    expect(res.body.email).toBe('john@test.com');
    expect(res.body.position).toBe('Developer');
  });

  test('created employee appears in subsequent GET /employees', async () => {
    await createEmployee({ name: 'Persist Me', email: 'persist@test.com', position: 'Tester' });
    const res = await request.get('/employees');
    expect(res.body.some(e => e.name === 'Persist Me')).toBe(true);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request.post('/employees').send({ email: 'a@b.com', position: 'Dev' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when email is missing', async () => {
    const res = await request.post('/employees').send({ name: 'John', position: 'Dev' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when position is missing', async () => {
    const res = await request.post('/employees').send({ name: 'John', email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when body is empty', async () => {
    const res = await request.post('/employees').send({});
    expect(res.status).toBe(400);
  });
});

// ─── PUT /employees/:id ───────────────────────────────────────────────────────

describe('PUT /employees/:id', () => {
  beforeEach(clearAllEmployees);

  test('updates all fields and returns updated record', async () => {
    const created = await createEmployee({ name: 'Old', email: 'old@test.com', position: 'Junior' });
    const id = created.body.id;

    const res = await request.put(`/employees/${id}`).send({
      name: 'Updated', email: 'new@test.com', position: 'Senior',
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
    expect(res.body.email).toBe('new@test.com');
    expect(res.body.position).toBe('Senior');
  });

  test('updated values persist in GET /employees', async () => {
    const created = await createEmployee({ name: 'Before', email: 'before@t.com', position: 'Dev' });
    const id = created.body.id;
    await request.put(`/employees/${id}`).send({ name: 'After', email: 'after@t.com', position: 'Lead' });

    const res = await request.get('/employees');
    const updated = res.body.find(e => e.id === id);
    expect(updated.name).toBe('After');
    expect(updated.position).toBe('Lead');
  });

  test('returns 400 when required fields are missing', async () => {
    const created = await createEmployee({ name: 'Test', email: 'test@t.com', position: 'Dev' });
    const res = await request.put(`/employees/${created.body.id}`).send({ name: 'Only Name' });
    expect(res.status).toBe(400);
  });

  test('returns 404 for a non-existent employee id', async () => {
    const res = await request.put('/employees/99999').send({
      name: 'Ghost', email: 'ghost@t.com', position: 'None',
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });
});

// ─── DELETE /employees/:id ────────────────────────────────────────────────────

describe('DELETE /employees/:id', () => {
  beforeEach(clearAllEmployees);

  test('deletes employee and returns success:true', async () => {
    const created = await createEmployee({ name: 'ToDelete', email: 'del@t.com', position: 'Temp' });
    const res = await request.delete(`/employees/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('deleted employee no longer appears in GET /employees', async () => {
    const created = await createEmployee({ name: 'Gone', email: 'gone@t.com', position: 'Temp' });
    await request.delete(`/employees/${created.body.id}`);
    const res = await request.get('/employees');
    expect(res.body.every(e => e.id !== created.body.id)).toBe(true);
  });

  test('returns 404 for a non-existent employee id', async () => {
    const res = await request.delete('/employees/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Employee not found');
  });
});
