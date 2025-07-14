class AirQualityApp {
  constructor() {
    this.aqiChart = null;
    this.weatherChart = null;
    this.historicalData = {
      aqi: [],
      weather: []
    };
    this.currentPeriod = '24h';
    
    this.init();
  }

  async init() {
    this.showLoading(true);
    await this.loadCurrentData();
    this.initCharts();
    this.setupEventListeners();
    this.startAutoRefresh();
    this.showLoading(false);
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.toggle('show', show);
  }

  async loadCurrentData() {
    try {
      const [airQualityData, weatherData] = await Promise.all([
        this.fetchAirQuality(),
        this.fetchWeather()
      ]);

      this.updateAirQualityDisplay(airQualityData);
      this.updateWeatherDisplay(weatherData);
      this.updateHealthRecommendations(airQualityData.aqi);
      this.updateLastUpdated();
      
      // Store data for historical tracking
      this.storeHistoricalData(airQualityData, weatherData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data. Please try again.');
    }
  }

  async fetchAirQuality() {
    const response = await fetch('/api/air-quality');
    if (!response.ok) throw new Error('Failed to fetch air quality data');
    return response.json();
  }

  async fetchWeather() {
    const response = await fetch('/api/weather');
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  }

  updateAirQualityDisplay(data) {
    const { aqi, pm2_5, pm10, no2, o3 } = data;
    
    // Update AQI badge
    document.getElementById('aqiValue').textContent = aqi;
    document.getElementById('aqiLevel').textContent = this.getAQILevel(aqi);
    
    const badge = document.getElementById('aqiBadge');
    badge.className = `aqi-badge ${this.getAQIClass(aqi)}`;
    
    // Update pollutant values and bars
    this.updatePollutant('pm25', pm2_5, 25);
    this.updatePollutant('pm10', pm10, 50);
    this.updatePollutant('no2', no2 || 0, 40);
    this.updatePollutant('o3', o3 || 0, 100);
  }

  updatePollutant(id, value, maxValue) {
    document.getElementById(id).textContent = `${Math.round(value)} μg/m³`;
    const bar = document.getElementById(`${id}Bar`);
    const percentage = Math.min((value / maxValue) * 100, 100);
    bar.style.width = `${percentage}%`;
    bar.className = `fill ${id}-bar`;
  }

  updateWeatherDisplay(data) {
    const { 
      temperature, 
      feels_like, 
      description, 
      humidity, 
      wind_speed, 
      visibility, 
      pressure,
      icon 
    } = data;

    document.getElementById('temperature').textContent = `${Math.round(temperature)}°C`;
    document.getElementById('feelsLike').textContent = `${Math.round(feels_like)}°C`;
    document.getElementById('weatherDescription').textContent = description;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(wind_speed * 3.6)} km/h`;
    document.getElementById('visibility').textContent = `${Math.round(visibility / 1000)} km`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    
    // Update weather icon
    const iconElement = document.getElementById('weatherIcon');
    iconElement.className = this.getWeatherIcon(icon);
  }

  getWeatherIcon(iconCode) {
    const iconMap = {
      '01d': 'fas fa-sun',
      '01n': 'fas fa-moon',
      '02d': 'fas fa-cloud-sun',
      '02n': 'fas fa-cloud-moon',
      '03d': 'fas fa-cloud',
      '03n': 'fas fa-cloud',
      '04d': 'fas fa-clouds',
      '04n': 'fas fa-clouds',
      '09d': 'fas fa-cloud-rain',
      '09n': 'fas fa-cloud-rain',
      '10d': 'fas fa-cloud-sun-rain',
      '10n': 'fas fa-cloud-moon-rain',
      '11d': 'fas fa-bolt',
      '11n': 'fas fa-bolt',
      '13d': 'fas fa-snowflake',
      '13n': 'fas fa-snowflake',
      '50d': 'fas fa-smog',
      '50n': 'fas fa-smog'
    };
    return iconMap[iconCode] || 'fas fa-sun';
  }

  getAQILevel(aqi) {
    const levels = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor'
    };
    return levels[aqi] || 'Unknown';
  }

  getAQIClass(aqi) {
    const classes = {
      1: 'aqi-good',
      2: 'aqi-fair',
      3: 'aqi-moderate',
      4: 'aqi-poor',
      5: 'aqi-very-poor'
    };
    return classes[aqi] || 'aqi-good';
  }

  updateHealthRecommendations(aqi) {
    const recommendations = {
      1: `
        <p><strong>Excellent air quality!</strong> Perfect conditions for all outdoor activities.</p>
        <p>• Great time for jogging, cycling, or any outdoor exercise</p>
        <p>• Windows can be kept open for natural ventilation</p>
        <p>• No health precautions needed</p>
      `,
      2: `
        <p><strong>Good air quality.</strong> Suitable for most outdoor activities.</p>
        <p>• Safe for outdoor exercise and activities</p>
        <p>• Sensitive individuals should monitor symptoms</p>
        <p>• Generally safe for everyone</p>
      `,
      3: `
        <p><strong>Moderate air quality.</strong> Sensitive groups should be cautious.</p>
        <p>• Limit prolonged outdoor exertion if you're sensitive</p>
        <p>• Consider indoor activities during peak hours</p>
        <p>• Use air purifiers indoors if available</p>
      `,
      4: `
        <p><strong>Poor air quality.</strong> Health effects possible for sensitive groups.</p>
        <p>• Avoid outdoor exercise, especially for children and elderly</p>
        <p>• Keep windows closed and use air purifiers</p>
        <p>• Wear N95 masks when going outside</p>
        <p>• Stay hydrated and avoid strenuous activities</p>
      `,
      5: `
        <p><strong>Very poor air quality!</strong> Health warnings for everyone.</p>
        <p>• Avoid all outdoor activities</p>
        <p>• Keep windows and doors closed</p>
        <p>• Use air purifiers and wear N95 masks outside</p>
        <p>• Seek medical attention if experiencing symptoms</p>
        <p>• Consider staying indoors until conditions improve</p>
      `
    };

    document.getElementById('healthAdvice').innerHTML = 
      recommendations[aqi] || recommendations[3];
  }

  updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    document.getElementById('lastUpdated').textContent = `Updated at ${timeString}`;
  }

  storeHistoricalData(airQualityData, weatherData) {
    const timestamp = new Date();
    
    // Store AQI data
    this.historicalData.aqi.push({
      timestamp,
      aqi: airQualityData.aqi,
      pm25: airQualityData.pm2_5,
      pm10: airQualityData.pm10
    });

    // Store weather data
    this.historicalData.weather.push({
      timestamp,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      pressure: weatherData.pressure
    });

    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.historicalData.aqi = this.historicalData.aqi.filter(d => d.timestamp > thirtyDaysAgo);
    this.historicalData.weather = this.historicalData.weather.filter(d => d.timestamp > thirtyDaysAgo);

    // Update charts
    this.updateCharts();
  }

  initCharts() {
    // Initialize AQI Chart
    const aqiCtx = document.getElementById('aqiChart').getContext('2d');
    this.aqiChart = new Chart(aqiCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'AQI',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }, {
          label: 'PM2.5',
          data: [],
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });

    // Initialize Weather Chart
    const weatherCtx = document.getElementById('weatherChart').getContext('2d');
    this.weatherChart = new Chart(weatherCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Temperature (°C)',
          data: [],
          borderColor: '#ed8936',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: 'Humidity (%)',
          data: [],
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });

    // Generate some sample historical data for demonstration
    this.generateSampleData();
  }

  generateSampleData() {
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Generate realistic sample data
      const baseAqi = 2 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.5;
      const basePm25 = 15 + Math.sin(i * 0.2) * 10 + Math.random() * 5;
      const baseTemp = 25 + Math.sin(i * 0.1) * 5 + Math.random() * 2;
      const baseHumidity = 60 + Math.sin(i * 0.15) * 20 + Math.random() * 5;

      this.historicalData.aqi.push({
        timestamp,
        aqi: Math.max(1, Math.min(5, Math.round(baseAqi))),
        pm25: Math.max(0, basePm25),
        pm10: Math.max(0, basePm25 * 1.5)
      });

      this.historicalData.weather.push({
        timestamp,
        temperature: baseTemp,
        humidity: Math.max(0, Math.min(100, baseHumidity)),
        pressure: 1013 + Math.random() * 10 - 5
      });
    }

    this.updateCharts();
  }

  updateCharts() {
    const period = this.currentPeriod;
    let filteredAqiData, filteredWeatherData;

    // Filter data based on selected period
    const now = new Date();
    let cutoffTime;
    
    switch (period) {
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    filteredAqiData = this.historicalData.aqi.filter(d => d.timestamp > cutoffTime);
    filteredWeatherData = this.historicalData.weather.filter(d => d.timestamp > cutoffTime);

    // Update AQI Chart
    const aqiLabels = filteredAqiData.map(d => 
      d.timestamp.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: period !== '24h' ? '2-digit' : undefined,
        month: period === '30d' ? 'short' : undefined
      })
    );
    
    this.aqiChart.data.labels = aqiLabels;
    this.aqiChart.data.datasets[0].data = filteredAqiData.map(d => d.aqi);
    this.aqiChart.data.datasets[1].data = filteredAqiData.map(d => d.pm25);
    this.aqiChart.update();

    // Update Weather Chart
    const weatherLabels = filteredWeatherData.map(d => 
      d.timestamp.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: period !== '24h' ? '2-digit' : undefined,
        month: period === '30d' ? 'short' : undefined
      })
    );
    
    this.weatherChart.data.labels = weatherLabels;
    this.weatherChart.data.datasets[0].data = filteredWeatherData.map(d => d.temperature);
    this.weatherChart.data.datasets[1].data = filteredWeatherData.map(d => d.humidity);
    this.weatherChart.update();
  }

  setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadCurrentData();
    });

    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.target.dataset.period;
        if (period) {
          this.currentPeriod = period;
          
          // Update active button
          e.target.parentElement.querySelectorAll('.chart-btn').forEach(b => 
            b.classList.remove('active')
          );
          e.target.classList.add('active');
          
          this.updateCharts();
        }
      });
    });
  }

  startAutoRefresh() {
    // Refresh data every 10 minutes
    setInterval(() => {
      this.loadCurrentData();
    }, 10 * 60 * 1000);
  }

  showError(message) {
    // You could implement a toast notification system here
    console.error(message);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AirQualityApp();
});