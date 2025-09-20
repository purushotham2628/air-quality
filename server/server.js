const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

// Initialize cache with 15-minute TTL for ML predictions
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Configure advanced logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 5000;

// Production-ready middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openweathermap.org']
    }
  }
}));
app.use(compression());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Make cache and logger available to routes
app.set('cache', cache);
app.set('logger', logger);
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api', require('./routes/api'));
app.use('/api/ml', require('./routes/ml'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌟 Air Quality Monitor Server running at http://0.0.0.0:${PORT}`);
  logger.info(`📊 Dashboard available at http://0.0.0.0:${PORT}`);
  logger.info(`🚀 Production features enabled: Security, Compression, Caching, Logging`);
  
  if (!process.env.API_KEY) {
    logger.warn('⚠️  Warning: API_KEY not found in environment variables');
    logger.info('📝 Please create a .env file with your OpenWeatherMap API key');
  }
});