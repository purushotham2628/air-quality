// Clean Air Quality Monitor JavaScript
class AirQualityMonitor {
  constructor() {
    this.charts = {};
    this.currentLocation = 'central';
    this.refreshInterval = null;
    this.init();
  }

  async init() {
    console.log('🌟 Air Quality Monitor initialized');
    
    this.setupEventListeners();
    this.initializeCharts();
    await this.loadAllData();
    this.startAutoRefresh();
    this.hideLoadingOverlay();
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Chart controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleChartPeriodChange(e));
    });

    // Comparison controls
    document.querySelectorAll('.comparison-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleComparisonMetricChange(e));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  initializeCharts() {
    try {
      // AQI Chart
      const aqiCtx = document.getElementById('aqiChart');
      if (aqiCtx) {
        this.charts.aqi = new Chart(aqiCtx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'AQI',
              data: [],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 5,
                ticks: {
                  stepSize: 1,
                  callback: function(value) {
                    const levels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
                    return levels[value] || value;
                  }
                },
                grid: {
                  color: '#f1f5f9'
                }
              },
              x: {
                grid: {
                  color: '#f1f5f9'
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });
      }

      // Weather Chart
      const weatherCtx = document.getElementById('weatherChart');
      if (weatherCtx) {
        this.charts.weather = new Chart(weatherCtx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y'
              },
              {
                label: 'Humidity (%)',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Temperature (°C)'
                },
                grid: {
                  color: '#f1f5f9'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Humidity (%)'
                },
                grid: {
                  drawOnChartArea: false
                },
                max: 100
              },
              x: {
                grid: {
                  color: '#f1f5f9'
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });
      }

      console.log('📊 Charts initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing charts:', error);
      this.showToast('Failed to initialize charts', 'error');
    }
  }

  async loadAllData() {
    this.showLoadingOverlay();
    
    try {
      await Promise.all([
        this.loadWeatherData(),
        this.loadAirQualityData(),
        this.loadHistoricalData(),
        this.loadLocationComparison(),
        this.loadWeeklyForecast()
      ]);
      
      this.updateLastUpdated();
      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showToast('Failed to load data', 'error');
    } finally {
      this.hideLoadingOverlay();
    }
  }

  async loadWeatherData() {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.updateWeatherDisplay(data);
    } catch (error) {
      console.error('❌ Error loading weather data:', error);
      this.showToast('Failed to load weather data', 'error');
    }
  }

  async loadAirQualityData() {
    try {
      const response = await fetch('/api/air-quality');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.updateAirQualityDisplay(data);
      this.updateHealthRecommendations(data.aqi);
    } catch (error) {
      console.error('❌ Error loading air quality data:', error);
      this.showToast('Failed to load air quality data', 'error');
    }
  }

  async loadHistoricalData() {
    try {
      const [aqiData, weatherData] = await Promise.all([
        fetch('/api/historical/aqi?period=24h').then(r => r.json()),
        fetch('/api/historical/weather?period=24h').then(r => r.json())
      ]);

      this.updateAQIChart(aqiData);
      this.updateWeatherChart(weatherData);
    } catch (error) {
      console.error('❌ Error loading historical data:', error);
      this.showToast('Failed to load historical data', 'error');
    }
  }

  updateWeatherDisplay(data) {
    const elements = {
      temperature: document.getElementById('temperature'),
      feelsLike: document.getElementById('feelsLike'),
      weatherDescription: document.getElementById('weatherDescription'),
      humidity: document.getElementById('humidity'),
      windSpeed: document.getElementById('windSpeed'),
      visibility: document.getElementById('visibility'),
      pressure: document.getElementById('pressure'),
      weatherIcon: document.getElementById('weatherIcon')
    };

    if (elements.temperature) elements.temperature.textContent = `${Math.round(data.temperature)}°`;
    if (elements.feelsLike) elements.feelsLike.textContent = `${Math.round(data.feels_like)}°C`;
    if (elements.weatherDescription) elements.weatherDescription.textContent = data.description;
    if (elements.humidity) elements.humidity.textContent = `${data.humidity}%`;
    if (elements.windSpeed) elements.windSpeed.textContent = `${Math.round(data.wind_speed * 3.6)} km/h`;
    if (elements.visibility) elements.visibility.textContent = `${data.visibility} km`;
    if (elements.pressure) elements.pressure.textContent = `${data.pressure} hPa`;

    // Update weather icon
    if (elements.weatherIcon) {
      const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
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
      
      elements.weatherIcon.className = iconMap[data.icon] || 'fas fa-sun';
    }
  }

  updateAirQualityDisplay(data) {
    const aqiValue = document.getElementById('aqiValue');
    const aqiLevel = document.getElementById('aqiLevel');
    const aqiBadge = document.getElementById('aqiBadge');
    
    const aqiLevels = {
      1: { level: 'Good', class: 'aqi-good' },
      2: { level: 'Fair', class: 'aqi-fair' },
      3: { level: 'Moderate', class: 'aqi-moderate' },
      4: { level: 'Poor', class: 'aqi-poor' },
      5: { level: 'Very Poor', class: 'aqi-very-poor' }
    };

    const currentLevel = aqiLevels[data.aqi] || aqiLevels[1];

    if (aqiValue) aqiValue.textContent = data.aqi;
    if (aqiLevel) aqiLevel.textContent = currentLevel.level;
    if (aqiBadge) {
      aqiBadge.className = `aqi-badge ${currentLevel.class}`;
    }

    // Update pollutant values and bars
    this.updatePollutantBar('pm25', data.pm2_5, 25);
    this.updatePollutantBar('pm10', data.pm10, 50);
    this.updatePollutantBar('no2', data.no2, 40);
    this.updatePollutantBar('o3', data.o3, 120);
  }

  updatePollutantBar(pollutant, value, maxValue) {
    const valueElement = document.getElementById(pollutant);
    const barElement = document.getElementById(`${pollutant}Bar`);

    if (valueElement) valueElement.textContent = `${Math.round(value * 100) / 100} μg/m³`;
    if (barElement) {
      const percentage = Math.min((value / maxValue) * 100, 100);
      barElement.style.width = `${percentage}%`;
      
      // Color based on percentage
      if (percentage <= 50) {
        barElement.style.background = '#10b981';
      } else if (percentage <= 75) {
        barElement.style.background = '#f59e0b';
      } else {
        barElement.style.background = '#ef4444';
      }
    }
  }

  updateHealthRecommendations(aqi) {
    const healthAdvice = document.getElementById('healthAdvice');
    if (!healthAdvice) return;

    const recommendations = {
      1: {
        icon: 'fas fa-check-circle',
        class: 'good',
        title: 'Excellent Air Quality',
        advice: [
          'Perfect conditions for all outdoor activities',
          'Great time for jogging, cycling, and sports',
          'No health precautions needed'
        ]
      },
      2: {
        icon: 'fas fa-thumbs-up',
        class: 'good',
        title: 'Good Air Quality',
        advice: [
          'Suitable for all outdoor activities',
          'Ideal for morning walks and exercise',
          'Generally safe for everyone'
        ]
      },
      3: {
        icon: 'fas fa-exclamation-triangle',
        class: 'moderate',
        title: 'Moderate Air Quality',
        advice: [
          'Limit prolonged outdoor activities',
          'Sensitive groups should reduce outdoor exercise',
          'Consider wearing a mask during outdoor activities'
        ]
      },
      4: {
        icon: 'fas fa-times-circle',
        class: 'poor',
        title: 'Poor Air Quality',
        advice: [
          'Avoid outdoor activities, especially for sensitive groups',
          'Wear N95 masks when going outside',
          'Keep windows and doors closed'
        ]
      },
      5: {
        icon: 'fas fa-skull-crossbones',
        class: 'poor',
        title: 'Very Poor Air Quality',
        advice: [
          'Stay indoors as much as possible',
          'Avoid all outdoor physical activities',
          'Seek medical attention if experiencing symptoms'
        ]
      }
    };

    const rec = recommendations[aqi] || recommendations[3];
    
    healthAdvice.innerHTML = `
      <div class="health-recommendation ${rec.class}">
        <i class="${rec.icon}"></i>
        <div>
          <strong>${rec.title}</strong>
          ${rec.advice.map(advice => `<p>${advice}</p>`).join('')}
        </div>
      </div>
    `;
  }

  updateAQIChart(data) {
    if (!this.charts.aqi || !data || data.length === 0) return;

    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.getHours().toString().padStart(2, '0') + ':00';
    });

    const aqiData = data.map(item => item.aqi);

    this.charts.aqi.data.labels = labels;
    this.charts.aqi.data.datasets[0].data = aqiData;
    this.charts.aqi.update('none');
  }

  updateWeatherChart(data) {
    if (!this.charts.weather || !data || data.length === 0) return;

    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.getHours().toString().padStart(2, '0') + ':00';
    });

    const tempData = data.map(item => Math.round(item.temperature * 10) / 10);
    const humidityData = data.map(item => item.humidity);

    this.charts.weather.data.labels = labels;
    this.charts.weather.data.datasets[0].data = tempData;
    this.charts.weather.data.datasets[1].data = humidityData;
    this.charts.weather.update('none');
  }

  async loadLocationComparison() {
    // Generate realistic location data
    const baseTemp = 26;
    const baseHumidity = 65;
    const baseAqi = 3;
    
    const locations = [
      { 
        name: 'Central Bengaluru', 
        aqi: baseAqi, 
        temp: Math.round((baseTemp + (Math.random() - 0.5) * 4) * 10) / 10, 
        humidity: Math.round(baseHumidity + (Math.random() - 0.5) * 10) 
      },
      { 
        name: 'Whitefield', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 2 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity + 5 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Koramangala', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + 1 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity - 3 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Electronic City', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 1 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity + 3 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Hebbal', 
        aqi: Math.min(5, baseAqi + 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp + 2 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity - 5 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Jayanagar', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity + 1 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Marathahalli', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 1 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity + 4 + (Math.random() - 0.5) * 8) 
      },
      { 
        name: 'Indiranagar', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + 1 + (Math.random() - 0.5) * 3) * 10) / 10, 
        humidity: Math.round(baseHumidity - 2 + (Math.random() - 0.5) * 8) 
      }
    ];

    this.updateLocationComparison(locations, 'aqi');
  }

  updateLocationComparison(locations, metric) {
    const grid = document.getElementById('comparisonGrid');
    if (!grid) return;

    grid.innerHTML = '';

    locations.forEach((location, index) => {
      const item = document.createElement('div');
      item.className = `location-item ${index === 0 ? 'current' : ''}`;
      
      let value, status, statusClass;
      
      switch (metric) {
        case 'aqi':
          value = location.aqi;
          const aqiLevels = {
            1: { status: 'Good', class: 'status-good' },
            2: { status: 'Fair', class: 'status-fair' },
            3: { status: 'Moderate', class: 'status-moderate' },
            4: { status: 'Poor', class: 'status-poor' },
            5: { status: 'Very Poor', class: 'status-very-poor' }
          };
          status = aqiLevels[value].status;
          statusClass = aqiLevels[value].class;
          break;
        case 'temp':
          value = `${location.temp}°C`;
          status = location.temp > 32 ? 'Very Hot' : location.temp > 28 ? 'Hot' : location.temp > 24 ? 'Warm' : 'Cool';
          statusClass = location.temp > 32 ? 'status-very-poor' : location.temp > 28 ? 'status-poor' : location.temp > 24 ? 'status-fair' : 'status-good';
          break;
        case 'humidity':
          value = `${location.humidity}%`;
          status = location.humidity > 80 ? 'Very High' : location.humidity > 70 ? 'High' : location.humidity > 50 ? 'Moderate' : 'Low';
          statusClass = location.humidity > 80 ? 'status-very-poor' : location.humidity > 70 ? 'status-poor' : location.humidity > 50 ? 'status-fair' : 'status-good';
          break;
      }

      item.innerHTML = `
        <div class="location-name">${location.name}</div>
        <div class="location-metric">${value}</div>
        <div class="location-status ${statusClass}">${status}</div>
      `;

      grid.appendChild(item);
    });
  }

  async loadWeeklyForecast() {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weatherConditions = [
      { icon: 'fas fa-sun' },
      { icon: 'fas fa-cloud-sun' },
      { icon: 'fas fa-cloud' },
      { icon: 'fas fa-cloud-rain' },
      { icon: 'fas fa-sun' },
      { icon: 'fas fa-cloud-sun' },
      { icon: 'fas fa-cloud' }
    ];
    
    const forecastGrid = document.getElementById('weeklyForecast');
    if (!forecastGrid) return;

    forecastGrid.innerHTML = '';

    days.forEach((day, index) => {
      const baseTemp = 26;
      const tempVariation = Math.sin(index * 0.5) * 4 + (Math.random() - 0.5) * 3;
      const high = Math.round(baseTemp + tempVariation + 3);
      const low = Math.round(high - 6 - Math.random() * 4);
      
      const isWeekend = index === 5 || index === 6;
      const baseAqi = isWeekend ? 2 : 3;
      const aqi = Math.max(1, Math.min(5, baseAqi + Math.floor(Math.random() * 2)));
      
      const aqiLevels = {
        1: { level: 'Good', class: 'status-good' },
        2: { level: 'Fair', class: 'status-fair' },
        3: { level: 'Moderate', class: 'status-moderate' },
        4: { level: 'Poor', class: 'status-poor' },
        5: { level: 'Very Poor', class: 'status-very-poor' }
      };

      const dayElement = document.createElement('div');
      dayElement.className = 'forecast-day';
      dayElement.innerHTML = `
        <div class="forecast-date">${day}</div>
        <div class="forecast-icon">
          <i class="${weatherConditions[index].icon}"></i>
        </div>
        <div class="forecast-temps">
          <span class="forecast-high">${high}°</span>
          <span class="forecast-low">${low}°</span>
        </div>
        <div class="forecast-aqi ${aqiLevels[aqi].class}">${aqiLevels[aqi].level}</div>
      `;

      forecastGrid.appendChild(dayElement);
    });
  }

  // Event Handlers
  async handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
    }

    try {
      await this.loadAllData();
      this.showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      this.showToast('Failed to refresh data', 'error');
    } finally {
      if (refreshBtn) {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
      }
    }
  }

  async handleChartPeriodChange(event) {
    const period = event.target.dataset.period;
    const chartContainer = event.target.closest('.chart-card');
    
    // Update active button
    chartContainer.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    try {
      // Load data for the selected period
      const [aqiData, weatherData] = await Promise.all([
        fetch(`/api/historical/aqi?period=${period}`).then(r => r.json()),
        fetch(`/api/historical/weather?period=${period}`).then(r => r.json())
      ]);

      // Update the appropriate chart
      if (chartContainer.querySelector('#aqiChart')) {
        this.updateAQIChart(aqiData);
      } else if (chartContainer.querySelector('#weatherChart')) {
        this.updateWeatherChart(weatherData);
      }
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      this.showToast('Failed to update chart', 'error');
    }
  }

  handleComparisonMetricChange(event) {
    const metric = event.target.dataset.metric;
    
    // Update active button
    document.querySelectorAll('.comparison-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Reload comparison data
    this.loadLocationComparison();
  }

  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh data
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.handleRefresh();
    }
  }

  // Utility Functions
  updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `Updated at ${now.toLocaleTimeString()}`;
    }
  }

  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('show');
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                 type === 'error' ? 'fas fa-exclamation-circle' : 
                 'fas fa-info-circle';
    
    toast.innerHTML = `
      <i class="${icon}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  startAutoRefresh() {
    // Refresh data every 10 minutes
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      this.loadAllData();
    }, 10 * 60 * 1000);
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }
}

// Initialize the application
let airQualityMonitor;

document.addEventListener('DOMContentLoaded', function() {
  airQualityMonitor = new AirQualityMonitor();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (airQualityMonitor) {
    airQualityMonitor.destroy();
  }
});

// Export for debugging
window.airQualityMonitor = airQualityMonitor;