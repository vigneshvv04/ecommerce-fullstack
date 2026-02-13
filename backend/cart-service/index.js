const express = require('express');
const cors = require('cors');
const app = express();
const cartRoutes = require('./routes/cart');

const serviceName = 'cart-service';

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.use('/cart',cartRoutes)


const PORT = 3002;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`${serviceName} running on port ${PORT}`);
});

