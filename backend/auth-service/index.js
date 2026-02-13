const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

const USERS = [
  { id: 'u1', username: 'user123', password: 'password' },
  { id: 'u2', username: 'user124', password: 'password' }
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Please enter username" });
  }

  if (!password) {
    return res.status(400).json({ message: "Please enter password" });
  }

  const user = USERS.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    return res.status(200).json({
      message: 'Login Successful',
      userId: user.id,
      token: 'mock-token'
    });
  }

  return res.status(401).json({ message: 'Invalid Credentials' });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('auth-service running on port 3001');
});
