const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

/**
 * Kubernetes-native service discovery
 * DNS automatically resolves:
 * http://auth-service:3001
 */
const SERVICES = {
  'auth-service': 'http://auth-service:3001',
  'cart-service': 'http://cart-service:3002',
  'inventory-service': 'http://inventory-service:3003',
  'notification-service': 'http://notification-service:3004',
  'order-service': 'http://order-service:3005',
  'product-service': 'http://product-service:3006'
};

app.all('/api/:service/*', async (req, res) => {
  const { service } = req.params;
  const path = req.params[0];

  const serviceUrl = SERVICES[service];

  if (!serviceUrl) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const url = `${serviceUrl}/${path}`;
  console.log(`Forwarding request to: ${url}`);

  try {
    const response = await axios({
      method: req.method,
      url,
      headers: { ...req.headers, host: undefined },
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body
    });

    res.status(response.status).send(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      console.error(err.message);
      res.status(500).send(`Internal Server Error: ${err.message}`);
    }
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('API Gateway running on port 3000');
});
