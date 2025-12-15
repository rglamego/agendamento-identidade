const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes (to be implemented)
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/users', require('./routes/users'));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Agendamento Identidade API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
