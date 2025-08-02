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

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Air Quality API Error:', response.status, errorText);
      throw new Error(`OpenWeatherMap API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('Air Quality API Response:', JSON.stringify(data, null, 2));
    
    if (!data.list || data.list.length === 0) {
      throw new Error('No air quality data available');
    }

    const info = data.list[0].components;
    const aqi = data.list[0].main.aqi;

    // Convert WHO AQI (1-5) to US AQI equivalent for better understanding
    const convertToUSAQI = (whoAqi, pm25) => {
      if (whoAqi === 1) return Math.min(50, Math.max(0, pm25 * 2));
      if (whoAqi === 2) return Math.min(100, Math.max(51, 50 + pm25 * 1.5));
      if (whoAqi === 3) return Math.min(150, Math.max(101, 100 + pm25 * 1.2));
      if (whoAqi === 4) return Math.min(200, Math.max(151, 150 + pm25 * 1));
      return Math.min(300, Math.max(201, 200 + pm25 * 0.8));
    };

    res.json({
      aqi,
      aqi_us: Math.round(convertToUSAQI(aqi, info.pm2_5 || 0)),
      pm2_5: Math.round((info.pm2_5 || 0) * 100) / 100,
      pm10: Math.round((info.pm10 || 0) * 100) / 100,
      no2: Math.round((info.no2 || 0) * 100) / 100,
      o3: Math.round((info.o3 || 0) * 100) / 100,
      co: Math.round((info.co || 0) * 100) / 100,
      so2: Math.round((info.so2 || 0) * 100) / 100,
      nh3: Math.round((info.nh3 || 0) * 100) / 100,
      dominant_pollutant: getDominantPollutant(info),
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

// Helper function to determine dominant pollutant
function getDominantPollutant(components) {
  const pollutants = {
    'PM2.5': components.pm2_5 || 0,
    'PM10': components.pm10 || 0,
    'NO₂': components.no2 || 0,
    'O₃': components.o3 || 0,
    'CO': (components.co || 0) / 1000, // Convert to mg/m³
    'SO₂': components.so2 || 0
  };
  
  let maxPollutant = 'PM2.5';
  let maxValue = 0;
  
  Object.entries(pollutants).forEach(([pollutant, value]) => {
    if (value > maxValue) {
      maxValue = value;
      maxPollutant = pollutant;
    }
  });
  
  return maxPollutant;
}

// Weather endpoint
router.get('/weather', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API key not configured. Please add your OpenWeatherMap API key to the .env file." 
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API Error:', response.status, errorText);
      throw new Error(`OpenWeatherMap API responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('Weather API Response:', JSON.stringify(data, null, 2));

    // Calculate additional weather metrics
    const calculateHeatIndex = (temp, humidity) => {
      if (temp < 27) return temp;
      const hi = -8.78469475556 + 1.61139411 * temp + 2.33854883889 * humidity 
                 - 0.14611605 * temp * humidity - 0.012308094 * temp * temp
                 - 0.0164248277778 * humidity * humidity + 0.002211732 * temp * temp * humidity
                 + 0.00072546 * temp * humidity * humidity - 0.000003582 * temp * temp * humidity * humidity;
      return Math.round(hi * 10) / 10;
    };

    const calculateWindChill = (temp, windSpeed) => {
      if (temp > 10 || windSpeed < 4.8) return temp;
      const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
      return Math.round(wc * 10) / 10;
    };
    res.json({
      temperature: Math.round(data.main.temp * 10) / 10,
      feels_like: Math.round(data.main.feels_like * 10) / 10,
      heat_index: calculateHeatIndex(data.main.temp, data.main.humidity),
      wind_chill: calculateWindChill(data.main.temp, (data.wind?.speed || 0) * 3.6),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      weather_id: data.weather[0].id,
      wind_speed: Math.round((data.wind?.speed || 0) * 10) / 10,
      wind_direction: data.wind?.deg || 0,
      wind_gust: Math.round(((data.wind?.gust || data.wind?.speed || 0) * 1.2) * 10) / 10,
      visibility: Math.round((data.visibility || 10000) / 1000),
      clouds: data.clouds.all,
      rain_1h: data.rain?.['1h'] || 0,
      snow_1h: data.snow?.['1h'] || 0,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
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
      // Generate more realistic AQI data with daily patterns
      const hour = timestamp.getHours();
      const dayOfWeek = timestamp.getDay();
      
      // Traffic patterns: higher AQI during rush hours and weekdays
      let trafficFactor = 1;
      if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        trafficFactor = 1.5; // Rush hours
      }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        trafficFactor *= 0.7; // Weekends
      }
      
      // Weather influence: higher AQI in early morning (inversion layer)
      const weatherFactor = hour >= 5 && hour <= 8 ? 1.3 : 1;
      
      const baseAqi = 2.2 + Math.sin(i * 0.05) * 0.8 * trafficFactor * weatherFactor;
      const noise = (Math.random() - 0.5) * 0.6;
      const aqi = Math.max(1, Math.min(5, Math.round(baseAqi + noise)));
      
      // PM2.5 correlates with AQI but has its own patterns
      const basePm25 = 12 + (aqi - 1) * 8 + Math.sin(i * 0.03) * 6 + (Math.random() - 0.5) * 5;
      const pm25 = Math.max(0, Math.round(basePm25 * 100) / 100);
      
      data.push({
        timestamp: timestamp.toISOString(),
        aqi,
        aqi_us: Math.min(300, Math.max(0, Math.round(pm25 * 3.5 + (aqi - 1) * 25))),
        pm25,
        pm10: Math.round(pm25 * (1.3 + Math.random() * 0.4) * 100) / 100,
        no2: Math.round((8 + trafficFactor * 15 + Math.random() * 12) * 100) / 100,
        o3: Math.round((40 + Math.sin(hour * 0.3) * 30 + Math.random() * 20) * 100) / 100,
        co: Math.round((0.5 + trafficFactor * 0.8 + Math.random() * 0.4) * 100) / 100
      });
    } else if (type === 'weather') {
      // Generate more realistic weather data with daily cycles
      const hour = timestamp.getHours();
      const dayOfYear = Math.floor((timestamp - new Date(timestamp.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      
      // Seasonal temperature variation
      const seasonalTemp = 26 + Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * 4;
      
      // Daily temperature cycle
      const dailyTemp = seasonalTemp + Math.sin((hour - 6) * Math.PI / 12) * 6;
      
      const temperature = Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10;
      
      // Humidity inversely related to temperature
      const baseHumidity = 75 - (dailyTemp - 20) * 1.5 + Math.sin(i * 0.04) * 15;
      const humidity = Math.max(20, Math.min(95, Math.round(baseHumidity + (Math.random() - 0.5) * 10)));
      
      // Pressure with realistic variations
      const basePressure = 1013 + Math.sin(i * 0.01) * 8 + Math.sin(dayOfYear * 0.02) * 5;
      const pressure = Math.round(basePressure + (Math.random() - 0.5) * 8);
      
      // Wind speed with daily patterns
      const baseWind = 3 + Math.sin(hour * 0.2) * 2 + Math.random() * 3;
      const windSpeed = Math.max(0, Math.round(baseWind * 10) / 10);
      
      data.push({
        timestamp: timestamp.toISOString(),
        temperature: Math.round(dailyTemp * 10) / 10,
        feels_like: Math.round((dailyTemp + (humidity > 70 ? 2 : 0)) * 10) / 10,
        humidity,
        pressure,
        wind_speed: windSpeed,
        clouds: Math.max(0, Math.min(100, Math.round(50 + Math.sin(i * 0.1) * 30 + (Math.random() - 0.5) * 20))),
        visibility: Math.max(1, Math.min(10, Math.round(8 + (Math.random() - 0.5) * 4)))
      });
    }
  }

  return data.reverse(); // Return chronological order
}

module.exports = router;