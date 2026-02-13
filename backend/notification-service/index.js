const express = require('express');
const cors = require('cors');
const os = require('os');
const { connectRabbitMQ } = require('./rabbitmq');

const app = express();
const serviceName = 'notification-service';
const PORT = 3005;

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Health check endpoint for Consul
app.get('/health', (req, res) => res.send('OK'));

// Handle incoming RabbitMQ messages
const handleNotification = (message) => {
  console.log('📩 Notification Received:', message);

  switch (message.type) {
    case 'ORDER_PLACED':
      console.log(`🔔 Order Placed: ${message.data.orderId} for user ${message.data.userId}`);
      // Future: Send email/SMS/etc.
      break;
    default:
      console.warn('⚠️ Unknown message type:', message.type);
  }
};

// Start the service
const start = async () => {
  try {
    // Start RabbitMQ consumer
    await connectRabbitMQ(handleNotification);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`${serviceName} running on port ${PORT}`);
     
    });

  } catch (err) {
    console.error('🚨 Error starting Notification Service:', err.message);
  }
};

start();
