const express = require('express');
const router = express.Router();

const API_KEY = process.env.API_KEY;
const LAT = 12.9716; // Bengaluru latitude
const LON = 77.5946; // Bengaluru longitude

// Validate API key
if (!API_KEY) {
  console.error('❌ OpenWeatherMap API key not found in environment variables');
}

// Air Quality endpoint
router.get('/air-quality', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API key not configured. Please add your OpenWeatherMap API key to the .env file." 
      });
    }

    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.list || data.list.length === 0) {
      throw new Error('No air quality data available');
    }

    const info = data.list[0].components;
    const aqi = data.list[0].main.aqi;

    res.json({
      aqi,
      pm2_5: Math.round((info.pm2_5 || 0) * 100) / 100,
      pm10: Math.round((info.pm10 || 0) * 100) / 100,
      no2: Math.round((info.no2 || 0) * 100) / 100,
      o3: Math.round((info.o3 || 0) * 100) / 100,
      co: Math.round((info.co || 0) * 100) / 100,
      so2: Math.round((info.so2 || 0) * 100) / 100,
      nh3: Math.round((info.nh3 || 0) * 100) / 100,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Air quality API error:', err.message);
    res.status(500).json({ 
      error: "Failed to fetch air quality data",
      details: err.message 
    });
  }
});

// Weather endpoint
router.get('/weather', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API key not configured. Please add your OpenWeatherMap API key to the .env file." 
      });
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      temperature: Math.round(data.main.temp * 10) / 10,
      feels_like: Math.round(data.main.feels_like * 10) / 10,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: Math.round(data.wind.speed * 10) / 10,
      wind_direction: data.wind.deg || 0,
      visibility: data.visibility || 10000,
      clouds: data.clouds.all,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ 
      error: "Failed to fetch weather data",
      details: err.message 
    });
  }
});

// Historical data endpoint (enhanced mock data)
router.get('/historical/:type', async (req, res) => {
  const { type } = req.params;
  const { period = '24h' } = req.query;

  try {
    const mockData = generateMockHistoricalData(type, period);
    res.json(mockData);
  } catch (err) {
    console.error('Historical data error:', err.message);
    res.status(500).json({ 
      error: "Failed to fetch historical data",
      details: err.message 
    });
  }
});

function generateMockHistoricalData(type, period) {
  const now = new Date();
  const data = [];
  let hours, interval;

  switch (period) {
    case '24h':
      hours = 24;
      interval = 1; // Every hour
      break;
    case '7d':
      hours = 24 * 7;
      interval = 6; // Every 6 hours
      break;
    case '30d':
      hours = 24 * 30;
      interval = 24; // Every day
      break;
    default:
      hours = 24;
      interval = 1;
  }

  for (let i = hours; i >= 0; i -= interval) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    if (type === 'aqi') {
      // Generate realistic AQI data with some patterns
      const baseAqi = 2 + Math.sin(i * 0.1) * 1.5;
      const noise = (Math.random() - 0.5) * 0.8;
      const aqi = Math.max(1, Math.min(5, Math.round(baseAqi + noise)));
      
      const basePm25 = 15 + Math.sin(i * 0.05) * 10 + (Math.random() - 0.5) * 8;
      const pm25 = Math.max(0, Math.round(basePm25 * 100) / 100);
      
      data.push({
        timestamp: timestamp.toISOString(),
        aqi,
        pm25,
        pm10: Math.round(pm25 * 1.4 * 100) / 100,
        no2: Math.round((10 + Math.random() * 20) * 100) / 100,
        o3: Math.round((50 + Math.random() * 40) * 100) / 100
      });
    } else if (type === 'weather') {
      // Generate realistic weather data
      const baseTemp = 25 + Math.sin(i * 0.05) * 8 + Math.sin(i * 0.3) * 3;
      const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10;
      
      const baseHumidity = 60 + Math.sin(i * 0.08) * 25;
      const humidity = Math.max(20, Math.min(95, Math.round(baseHumidity + (Math.random() - 0.5) * 10)));
      
      const basePressure = 1013 + Math.sin(i * 0.02) * 15;
      const pressure = Math.round(basePressure + (Math.random() - 0.5) * 8);
      
      data.push({
        timestamp: timestamp.toISOString(),
        temperature,
        humidity,
        pressure,
        wind_speed: Math.round((2 + Math.random() * 8) * 10) / 10
      });
    }
  }

  return data.reverse(); // Return chronological order
}

module.exports = router;