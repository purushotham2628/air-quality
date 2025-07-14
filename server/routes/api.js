const express = require('express');
const router = express.Router();

const API_KEY = process.env.API_KEY;
const LAT = 12.9716; // Bengaluru latitude
const LON = 77.5946; // Bengaluru longitude

// Air Quality endpoint
router.get('/air-quality', async (req, res) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const info = data.list[0].components;
    const aqi = data.list[0].main.aqi;

    res.json({
      aqi,
      pm2_5: info.pm2_5 || 0,
      pm10: info.pm10 || 0,
      no2: info.no2 || 0,
      o3: info.o3 || 0,
      co: info.co || 0,
      so2: info.so2 || 0,
      nh3: info.nh3 || 0
    });
  } catch (err) {
    console.error('Air quality API error:', err);
    res.status(500).json({ error: "Failed to fetch air quality data" });
  }
});

// Weather endpoint
router.get('/weather', async (req, res) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      visibility: data.visibility,
      clouds: data.clouds.all,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    });
  } catch (err) {
    console.error('Weather API error:', err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Historical data endpoint (mock data for demonstration)
router.get('/historical/:type', async (req, res) => {
  const { type } = req.params;
  const { period = '24h' } = req.query;

  try {
    const mockData = generateMockHistoricalData(type, period);
    res.json(mockData);
  } catch (err) {
    console.error('Historical data error:', err);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

function generateMockHistoricalData(type, period) {
  const now = new Date();
  const data = [];
  let hours;

  switch (period) {
    case '24h':
      hours = 24;
      break;
    case '7d':
      hours = 24 * 7;
      break;
    case '30d':
      hours = 24 * 30;
      break;
    default:
      hours = 24;
  }

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    if (type === 'aqi') {
      data.push({
        timestamp: timestamp.toISOString(),
        aqi: Math.floor(Math.random() * 5) + 1,
        pm25: Math.random() * 50 + 10,
        pm10: Math.random() * 80 + 20
      });
    } else if (type === 'weather') {
      data.push({
        timestamp: timestamp.toISOString(),
        temperature: Math.random() * 15 + 20,
        humidity: Math.random() * 40 + 40,
        pressure: Math.random() * 20 + 1000
      });
    }
  }

  return data;
}

module.exports = router;
