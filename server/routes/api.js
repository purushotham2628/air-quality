const express = require('express');
const router = express.Router();

const API_KEY = process.env.API_KEY;

// Indian cities data
const CITIES = {
    'bengaluru': { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    'mumbai': { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    'delhi': { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    'chennai': { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    'kolkata': { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    'hyderabad': { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    'pune': { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    'ahmedabad': { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 }
};

const DEFAULT_CITY = 'bengaluru';

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

    const city = req.query.city || DEFAULT_CITY;
    const cityData = CITIES[city] || CITIES[DEFAULT_CITY];
    
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${cityData.lat}&lon=${cityData.lon}&appid=${API_KEY}`;
    
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

    // Enhanced AQI conversion with Indian standards
    const convertToIndianAQI = (whoAqi, pm25, pm10) => {
      // Indian AQI calculation based on CPCB standards
      let indianAqi = 0;
      
      // PM2.5 based calculation
      if (pm25 <= 30) indianAqi = Math.max(indianAqi, (pm25 / 30) * 50);
      else if (pm25 <= 60) indianAqi = Math.max(indianAqi, 50 + ((pm25 - 30) / 30) * 50);
      else if (pm25 <= 90) indianAqi = Math.max(indianAqi, 100 + ((pm25 - 60) / 30) * 100);
      else if (pm25 <= 120) indianAqi = Math.max(indianAqi, 200 + ((pm25 - 90) / 30) * 100);
      else indianAqi = Math.max(indianAqi, 300 + ((pm25 - 120) / 30) * 200);
      
      // PM10 based calculation
      if (pm10 <= 50) indianAqi = Math.max(indianAqi, (pm10 / 50) * 50);
      else if (pm10 <= 100) indianAqi = Math.max(indianAqi, 50 + ((pm10 - 50) / 50) * 50);
      else if (pm10 <= 250) indianAqi = Math.max(indianAqi, 100 + ((pm10 - 100) / 150) * 100);
      else if (pm10 <= 350) indianAqi = Math.max(indianAqi, 200 + ((pm10 - 250) / 100) * 100);
      else indianAqi = Math.max(indianAqi, 300 + ((pm10 - 350) / 80) * 200);
      
      return Math.min(500, Math.round(indianAqi));
    };

    res.json({
      city: cityData.name,
      city_key: city,
      aqi,
      aqi_indian: convertToIndianAQI(aqi, info.pm2_5 || 0, info.pm10 || 0),
      pm2_5: Math.round((info.pm2_5 || 0) * 100) / 100,
      pm10: Math.round((info.pm10 || 0) * 100) / 100,
      no2: Math.round((info.no2 || 0) * 100) / 100,
      o3: Math.round((info.o3 || 0) * 100) / 100,
      co: Math.round((info.co || 0) * 100) / 100,
      so2: Math.round((info.so2 || 0) * 100) / 100,
      nh3: Math.round((info.nh3 || 0) * 100) / 100,
      dominant_pollutant: getDominantPollutant(info),
      health_index: calculateHealthIndex(info, aqi),
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

// Enhanced health index calculation
function calculateHealthIndex(components, aqi) {
  const pm25Score = Math.max(0, 100 - (components.pm2_5 / 15) * 100);
  const pm10Score = Math.max(0, 100 - (components.pm10 / 45) * 100);
  const no2Score = Math.max(0, 100 - (components.no2 / 25) * 100);
  const o3Score = Math.max(0, 100 - (components.o3 / 100) * 100);
  const aqiScore = Math.max(0, 100 - (aqi - 1) * 20);
  
  // Weighted average with PM2.5 having highest impact
  const healthIndex = (pm25Score * 0.35 + pm10Score * 0.2 + no2Score * 0.15 + o3Score * 0.15 + aqiScore * 0.15);
  
  return Math.round(healthIndex);
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
      // Enhanced heat index calculation for tropical climate
      if (temp < 26) return temp;
      
      const c1 = -8.78469475556;
      const c2 = 1.61139411;
      const c3 = 2.33854883889;
      const c4 = -0.14611605;
      const c5 = -0.012308094;
      const c6 = -0.0164248277778;
      const c7 = 0.002211732;
      const c8 = 0.00072546;
      const c9 = -0.000003582;
      
      const hi = c1 + c2 * temp + c3 * humidity + c4 * temp * humidity + 
                 c5 * temp * temp + c6 * humidity * humidity + 
                 c7 * temp * temp * humidity + c8 * temp * humidity * humidity + 
                 c9 * temp * temp * humidity * humidity;
                 
      return Math.round(hi * 10) / 10;
    };

    const calculateWindChill = (temp, windSpeed) => {
      // Adjusted for Bengaluru's tropical climate
      if (temp > 15 || windSpeed < 5) return temp;
      const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 
                 0.3965 * temp * Math.pow(windSpeed, 0.16);
      return Math.round(wc * 10) / 10;
    };
    
    // Calculate UV Index based on time and weather
    const calculateUVIndex = (clouds, hour) => {
      if (hour < 6 || hour > 18) return 0;
      const solarAngle = Math.sin((hour - 6) * Math.PI / 12);
      const cloudFactor = (100 - clouds) / 100;
      const baseUV = solarAngle * 11; // Max UV for Bengaluru latitude
      return Math.round(Math.max(0, Math.min(11, baseUV * cloudFactor)));
    };
    
    const currentHour = new Date().getHours();
    
    res.json({
      temperature: Math.round(data.main.temp * 10) / 10,
      feels_like: Math.round(data.main.feels_like * 10) / 10,
      heat_index: calculateHeatIndex(data.main.temp, data.main.humidity),
      wind_chill: calculateWindChill(data.main.temp, (data.wind?.speed || 0) * 3.6),
      uv_index: calculateUVIndex(data.clouds.all, currentHour),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      sea_level_pressure: data.main.sea_level || data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      weather_id: data.weather[0].id,
      wind_speed: Math.round((data.wind?.speed || 0) * 10) / 10,
      wind_direction: data.wind?.deg || 0,
      wind_direction_text: getWindDirectionText(data.wind?.deg || 0),
      wind_gust: Math.round(((data.wind?.gust || data.wind?.speed || 0) * 1.2) * 10) / 10,
      visibility: Math.round((data.visibility || 10000) / 1000),
      clouds: data.clouds.all,
      cloud_description: getCloudDescription(data.clouds.all),
      rain_1h: data.rain?.['1h'] || 0,
      snow_1h: data.snow?.['1h'] || 0,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
      air_quality_impact: getAirQualityImpact(data.wind?.speed || 0, data.clouds.all),
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

// Helper function for wind direction
function getWindDirectionText(degrees) {
  const directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Helper function for cloud description
function getCloudDescription(cloudiness) {
  if (cloudiness <= 10) return 'Clear skies';
  if (cloudiness <= 25) return 'Few clouds';
  if (cloudiness <= 50) return 'Scattered clouds';
  if (cloudiness <= 75) return 'Broken clouds';
  return 'Overcast';
}

// Helper function for air quality impact
function getAirQualityImpact(windSpeed, clouds) {
  const windFactor = windSpeed > 3 ? 'Good dispersion' : 'Poor dispersion';
  const cloudFactor = clouds > 70 ? 'Limited UV, stable conditions' : 'Clear conditions, good mixing';
  return `${windFactor}, ${cloudFactor}`;
}

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
      const month = timestamp.getMonth();
      
      // Enhanced traffic patterns for Bengaluru
      let trafficFactor = 1;
      if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        trafficFactor = 1.8; // Heavy rush hours in Bengaluru
      }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        trafficFactor *= 0.6; // Significant weekend reduction
      }
      
      // Seasonal factors for Bengaluru
      let seasonalFactor = 1;
      if ([11, 0, 1, 2].includes(month)) seasonalFactor = 1.4; // Winter pollution
      if ([5, 6, 7, 8, 9].includes(month)) seasonalFactor = 0.7; // Monsoon cleaning
      
      // Weather influence: temperature inversion in early morning
      const weatherFactor = hour >= 5 && hour <= 8 ? 1.4 : 
                           hour >= 22 || hour <= 4 ? 1.2 : 1;
      
      const baseAqi = 2.8 + Math.sin(i * 0.05) * 0.8 * trafficFactor * weatherFactor * seasonalFactor;
      const noise = (Math.random() - 0.5) * 0.4;
      const aqi = Math.max(1, Math.min(5, Math.round(baseAqi + noise)));
      
      // More realistic PM2.5 for Bengaluru (typically 20-40 μg/m³)
      const basePm25 = 18 + (aqi - 1) * 12 + Math.sin(i * 0.03) * 8 + (Math.random() - 0.5) * 6;
      const pm25 = Math.max(0, Math.round(basePm25 * 100) / 100);
      
      // PM10 typically 1.5-2x PM2.5 in urban areas
      const pm10 = Math.round(pm25 * (1.6 + Math.random() * 0.6) * 100) / 100;
      
      // NO2 higher during traffic hours
      const no2Base = 15 + trafficFactor * 20 + (Math.random() - 0.5) * 8;
      const no2 = Math.max(0, Math.round(no2Base * 100) / 100);
      
      // O3 peaks during afternoon due to photochemical reactions
      const o3Base = 45 + Math.sin((hour - 12) * Math.PI / 12) * 35 + (Math.random() - 0.5) * 15;
      const o3 = Math.max(0, Math.round(o3Base * 100) / 100);
      
      // CO correlates with traffic
      const co = Math.round((0.4 + trafficFactor * 1.2 + (Math.random() - 0.5) * 0.3) * 100) / 100;
      
      data.push({
        timestamp: timestamp.toISOString(),
        aqi,
        aqi_indian: convertToIndianAQI(aqi, pm25, pm10),
        pm25,
        pm10,
        no2,
        o3,
        co,
        health_index: calculateHealthIndex(components, aqi)
      });
    } else if (type === 'weather') {
      // Enhanced weather data for Bengaluru's climate
      const hour = timestamp.getHours();
      const dayOfYear = Math.floor((timestamp - new Date(timestamp.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const month = timestamp.getMonth();
      
      // Bengaluru's seasonal temperature pattern
      const seasonalTemp = 25.5 + Math.sin((dayOfYear - 60) * 2 * Math.PI / 365) * 3.5;
      
      // Enhanced daily temperature cycle
      const dailyTemp = seasonalTemp + Math.sin((hour - 6) * Math.PI / 12) * 5.5;
      
      const temperature = Math.round((dailyTemp + (Math.random() - 0.5) * 2.5) * 10) / 10;
      
      // Realistic humidity for Bengaluru (higher during monsoon)
      const isMonsoon = [5, 6, 7, 8, 9].includes(month);
      const baseHumidity = isMonsoon ? 85 : 65;
      const humidityVariation = 78 - (dailyTemp - 22) * 1.8 + Math.sin(i * 0.04) * 12;
      const humidity = Math.max(30, Math.min(95, Math.round(humidityVariation + (Math.random() - 0.5) * 8)));
      
      // Pressure adjusted for Bengaluru's elevation (920m)
      const elevationPressure = 1013 - (920 * 0.12); // ~903 hPa at 920m
      const basePressure = elevationPressure + Math.sin(i * 0.01) * 6 + Math.sin(dayOfYear * 0.02) * 4;
      const pressure = Math.round(basePressure + (Math.random() - 0.5) * 5);
      
      // Enhanced wind patterns for Bengaluru
      const baseWind = 2.5 + Math.sin(hour * 0.3) * 2.5 + (isMonsoon ? 4 : 1) + Math.random() * 2;
      const windSpeed = Math.max(0, Math.round(baseWind * 10) / 10);
      
      // Cloud cover with seasonal variations
      const seasonalClouds = isMonsoon ? 75 : 35;
      const clouds = Math.max(0, Math.min(100, 
        Math.round(seasonalClouds + Math.sin(i * 0.1) * 25 + (Math.random() - 0.5) * 20)));
      
      // Visibility affected by pollution and weather
      const baseVisibility = isMonsoon ? 12 : 8;
      const visibility = Math.max(2, Math.min(15, 
        Math.round(baseVisibility + (Math.random() - 0.5) * 3)));
      
      data.push({
        timestamp: timestamp.toISOString(),
        temperature,
        feels_like: Math.round((temperature + (humidity > 70 ? 2.5 : 0)) * 10) / 10,
        heat_index: calculateHeatIndex(temperature, humidity),
        humidity,
        pressure,
        sea_level_pressure: Math.round((pressure + 110) * 10) / 10, // Approximate sea level
        wind_speed: windSpeed,
        wind_direction: Math.round(Math.random() * 360),
        clouds,
        visibility,
        uv_index: calculateUVIndex(clouds, currentHour),
        dew_point: Math.round((temperature - ((100 - humidity) / 5)) * 10) / 10
      });
    }
  }

  return data.reverse(); // Return chronological order
}

// Multi-city comparison endpoint
router.get('/cities/compare', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: "API key not configured. Please add your OpenWeatherMap API key to the .env file." 
      });
    }

    const cities = Object.keys(CITIES);
    const cityData = [];

    // Fetch data for all cities in parallel
    const promises = cities.map(async (cityKey) => {
      const city = CITIES[cityKey];
      try {
        const [airQualityResponse, weatherResponse] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`),
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
        ]);

        if (airQualityResponse.ok && weatherResponse.ok) {
          const airQualityData = await airQualityResponse.json();
          const weatherData = await weatherResponse.json();
          
          const aqiInfo = airQualityData.list[0];
          return {
            city: city.name,
            city_key: cityKey,
            aqi: aqiInfo.main.aqi,
            aqi_indian: convertToIndianAQI(aqiInfo.main.aqi, aqiInfo.components.pm2_5 || 0, aqiInfo.components.pm10 || 0),
            pm2_5: Math.round((aqiInfo.components.pm2_5 || 0) * 100) / 100,
            temperature: Math.round(weatherData.main.temp * 10) / 10,
            humidity: weatherData.main.humidity,
            wind_speed: Math.round((weatherData.wind?.speed || 0) * 10) / 10,
            timestamp: new Date().toISOString()
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching data for ${city.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);

    res.json({
      cities: validResults,
      total_cities: validResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Multi-city comparison error:', err.message);
    res.status(500).json({ 
      error: "Failed to fetch multi-city data",
      details: err.message 
    });
  }
});

// Cities list endpoint
router.get('/cities', (req, res) => {
  res.json({
    cities: Object.entries(CITIES).map(([key, city]) => ({
      key,
      name: city.name,
      lat: city.lat,
      lon: city.lon
    })),
    default_city: DEFAULT_CITY
  });
});

module.exports = router;