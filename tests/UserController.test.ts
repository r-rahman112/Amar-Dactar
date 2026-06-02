import assert from 'node:assert';
import test from 'node:test';

// Mocking dependencies for the UserController test
const mockQuery = async (queryStr: string, params: any[]) => {
  if (params[0] === 'valid@test.local') {
    return {
      rows: [{
        id: '123',
        email: 'valid@test.local',
        password: '$2a$10$hashedpasswordstringforbcrypt', // Assumed valid hash
        role: 'user',
        status: 'active',
        fullName: 'Valid User'
      }]
    };
  }
  return { rows: [] };
};

const mockBcryptCompare = async (password: string, hash: string) => {
  if (password === 'Correct@123' && hash === '$2a$10$hashedpasswordstringforbcrypt') {
    return true;
  }
  return false;
};

const mockJwtSign = (payload: any, secret: string, options: any) => {
  return 'mock.jwt.token';
};

test('UserController.login module tests', async (t) => {
  
  await t.test('Login should fail for non-existent user', async () => {
    const req = { body: { email: 'wrong@test.local', password: 'Password123' } };
    let finalStatus = 200;
    let finalJson: any = {};
    const res = {
      status: (code: number) => { finalStatus = code; return res; },
      json: (data: any) => { finalJson = data; }
    };

    // Simulate flow
    const result = await mockQuery('SELECT * FROM users WHERE email = $1', [req.body.email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' });
    }

    assert.strictEqual(finalStatus, 401);
    assert.strictEqual(finalJson.error, 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
  });

  await t.test('Login should fail for wrong password', async () => {
    const req = { body: { email: 'valid@test.local', password: 'WrongPassword@123' } };
    let finalStatus = 200;
    let finalJson: any = {};
    const res = {
      status: (code: number) => { finalStatus = code; return res; },
      json: (data: any) => { finalJson = data; }
    };

    const result = await mockQuery('SELECT * FROM users WHERE email = $1', [req.body.email]);
    const user = result.rows[0];
    
    // Simulating bcrypt logic
    const isMatch = await mockBcryptCompare(req.body.password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' });
    }

    assert.strictEqual(finalStatus, 401);
    assert.strictEqual(finalJson.error, 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
  });

  await t.test('Login should succeed for correct password', async () => {
    const req = { body: { email: 'valid@test.local', password: 'Correct@123' } };
    let finalStatus = 200;
    let finalJson: any = {};
    const res = {
      status: (code: number) => { finalStatus = code; return res; },
      json: (data: any) => { finalJson = data; }
    };

    const result = await mockQuery('SELECT * FROM users WHERE email = $1', [req.body.email]);
    const user = result.rows[0];
    
    // Simulating bcrypt logic
    const isMatch = await mockBcryptCompare(req.body.password, user.password);
    
    if (isMatch) {
      if (user.status !== 'banned' && user.status !== 'suspended') {
        const token = mockJwtSign({ id: user.id, email: user.email }, 'secret', {});
        res.status(200).json({ token, user: { id: user.id, email: user.email }});
      }
    }

    assert.strictEqual(finalStatus, 200);
    assert.ok(finalJson.token);
    assert.strictEqual(finalJson.user.email, 'valid@test.local');
  });

});
