const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api', require('./routes/api'));

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Air Quality Monitor Server running at http://0.0.0.0:${PORT}`);
  console.log(`📊 Dashboard available at http://0.0.0.0:${PORT}`);
  
  if (!process.env.API_KEY) {
    console.warn('⚠️  Warning: API_KEY not found in environment variables');
    console.log('📝 Please create a .env file with your OpenWeatherMap API key');
  }
});