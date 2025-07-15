class AirQualityApp {
  constructor() {
    this.aqiChart = null;
    this.weatherChart = null;
    this.historicalData = {
      aqi: [],
      weather: []
    };
    this.currentPeriod = '24h';
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    this.showLoading(true);
    try {
      await this.loadCurrentData();
      this.initCharts();
      this.setupEventListeners();
      this.startAutoRefresh();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.toggle('show', show);
    }
    this.isLoading = show;
  }

  async loadCurrentData() {
    if (this.isLoading) return;
    
    try {
      this.showRefreshAnimation(true);
      
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
      this.showError('Failed to load data. Please check your internet connection and try again.');
    } finally {
      this.showRefreshAnimation(false);
    }
  }

  showRefreshAnimation(show) {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.classList.toggle('spinning', show);
      refreshBtn.disabled = show;
    }
  }

  async fetchAirQuality() {
    const response = await fetch('/api/air-quality');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch air quality data');
    }
    return response.json();
  }

  async fetchWeather() {
    const response = await fetch('/api/weather');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch weather data');
    }
    return response.json();
  }

  updateAirQualityDisplay(data) {
    const { aqi, pm2_5, pm10, no2, o3 } = data;
    
    // Update AQI badge with animation
    this.animateValue('aqiValue', aqi, 0);
    document.getElementById('aqiLevel').textContent = this.getAQILevel(aqi);
    
    const badge = document.getElementById('aqiBadge');
    badge.className = `aqi-badge ${this.getAQIClass(aqi)}`;
    
    // Update pollutant values and bars with animation
    this.updatePollutant('pm25', pm2_5, 25);
    this.updatePollutant('pm10', pm10, 50);
    this.updatePollutant('no2', no2 || 0, 40);
    this.updatePollutant('o3', o3 || 0, 100);
  }

  animateValue(elementId, targetValue, startValue = 0, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = startValue + (targetValue - startValue) * this.easeOutCubic(progress);
      element.textContent = Math.round(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  updatePollutant(id, value, maxValue) {
    const valueElement = document.getElementById(id);
    const barElement = document.getElementById(`${id}Bar`);
    
    if (valueElement) {
      valueElement.textContent = `${Math.round(value * 100) / 100} μg/m³`;
    }
    
    if (barElement) {
      const percentage = Math.min((value / maxValue) * 100, 100);
      setTimeout(() => {
        barElement.style.width = `${percentage}%`;
        barElement.className = `fill ${id}-bar`;
      }, 100);
    }
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

    // Animate temperature
    this.animateTemperature(temperature);
    
    const elements = {
      'feelsLike': `${Math.round(feels_like)}°C`,
      'weatherDescription': this.capitalizeWords(description),
      'humidity': `${humidity}%`,
      'windSpeed': `${Math.round(wind_speed * 3.6)} km/h`,
      'visibility': `${Math.round(visibility / 1000)} km`,
      'pressure': `${pressure} hPa`
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
    
    // Update weather icon with animation
    const iconElement = document.getElementById('weatherIcon');
    if (iconElement) {
      iconElement.style.transform = 'scale(0)';
      setTimeout(() => {
        iconElement.className = this.getWeatherIcon(icon);
        iconElement.style.transform = 'scale(1)';
      }, 200);
    }
  }

  animateTemperature(targetTemp) {
    const tempElement = document.getElementById('temperature');
    if (!tempElement) return;

    const currentTemp = parseFloat(tempElement.textContent) || 0;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = currentTemp + (targetTemp - currentTemp) * this.easeOutCubic(progress);
      tempElement.textContent = `${Math.round(currentValue)}°C`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
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
        <div class="recommendation-item good">
          <i class="fas fa-check-circle"></i>
          <div>
            <strong>Excellent air quality!</strong>
            <p>Perfect conditions for all outdoor activities. Great time for jogging, cycling, or any outdoor exercise.</p>
          </div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-window-open"></i>
          <div>Windows can be kept open for natural ventilation</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-heart"></i>
          <div>No health precautions needed for any group</div>
        </div>
      `,
      2: `
        <div class="recommendation-item fair">
          <i class="fas fa-thumbs-up"></i>
          <div>
            <strong>Good air quality.</strong>
            <p>Suitable for most outdoor activities with minimal risk.</p>
          </div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-running"></i>
          <div>Safe for outdoor exercise and activities</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-exclamation-triangle"></i>
          <div>Sensitive individuals should monitor symptoms</div>
        </div>
      `,
      3: `
        <div class="recommendation-item moderate">
          <i class="fas fa-exclamation-circle"></i>
          <div>
            <strong>Moderate air quality.</strong>
            <p>Sensitive groups should be cautious with prolonged outdoor exposure.</p>
          </div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-clock"></i>
          <div>Limit prolonged outdoor exertion if you're sensitive</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-home"></i>
          <div>Consider indoor activities during peak pollution hours</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-wind"></i>
          <div>Use air purifiers indoors if available</div>
        </div>
      `,
      4: `
        <div class="recommendation-item poor">
          <i class="fas fa-times-circle"></i>
          <div>
            <strong>Poor air quality.</strong>
            <p>Health effects possible for sensitive groups. Take precautions.</p>
          </div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-ban"></i>
          <div>Avoid outdoor exercise, especially for children and elderly</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-window-close"></i>
          <div>Keep windows closed and use air purifiers</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-mask"></i>
          <div>Wear N95 masks when going outside</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-tint"></i>
          <div>Stay hydrated and avoid strenuous activities</div>
        </div>
      `,
      5: `
        <div class="recommendation-item very-poor">
          <i class="fas fa-skull-crossbones"></i>
          <div>
            <strong>Very poor air quality!</strong>
            <p>Health warnings for everyone. Immediate action required.</p>
          </div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-home"></i>
          <div>Avoid all outdoor activities - stay indoors</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-door-closed"></i>
          <div>Keep all windows and doors tightly closed</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-mask"></i>
          <div>Use air purifiers and wear N95 masks outside</div>
        </div>
        <div class="recommendation-item">
          <i class="fas fa-hospital"></i>
          <div>Seek medical attention if experiencing symptoms</div>
        </div>
      `
    };

    const adviceElement = document.getElementById('healthAdvice');
    if (adviceElement) {
      adviceElement.innerHTML = recommendations[aqi] || recommendations[3];
    }
  }

  updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    const element = document.getElementById('lastUpdated');
    if (element) {
      element.textContent = `Updated at ${timeString}`;
    }
  }

  storeHistoricalData(airQualityData, weatherData) {
    const timestamp = new Date();
    
    // Store AQI data
    this.historicalData.aqi.push({
      timestamp,
      aqi: airQualityData.aqi,
      pm25: airQualityData.pm2_5,
      pm10: airQualityData.pm10,
      no2: airQualityData.no2,
      o3: airQualityData.o3
    });

    // Store weather data
    this.historicalData.weather.push({
      timestamp,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      pressure: weatherData.pressure,
      wind_speed: weatherData.wind_speed
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
    const aqiCtx = document.getElementById('aqiChart');
    if (aqiCtx) {
      this.aqiChart = new Chart(aqiCtx.getContext('2d'), {
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
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }, {
            label: 'PM2.5 (μg/m³)',
            data: [],
            borderColor: '#f56565',
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#f56565',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#667eea',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#6b7280'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#6b7280',
                maxTicksLimit: 8
              }
            }
          }
        }
      });
    }

    // Initialize Weather Chart
    const weatherCtx = document.getElementById('weatherChart');
    if (weatherCtx) {
      this.weatherChart = new Chart(weatherCtx.getContext('2d'), {
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
            yAxisID: 'y',
            pointBackgroundColor: '#ed8936',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }, {
            label: 'Humidity (%)',
            data: [],
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
            pointBackgroundColor: '#48bb78',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                  weight: '500'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#ed8936',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#6b7280'
              },
              title: {
                display: true,
                text: 'Temperature (°C)',
                color: '#ed8936',
                font: {
                  size: 12,
                  weight: '600'
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#6b7280'
              },
              title: {
                display: true,
                text: 'Humidity (%)',
                color: '#48bb78',
                font: {
                  size: 12,
                  weight: '600'
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 11
                },
                color: '#6b7280',
                maxTicksLimit: 8
              }
            }
          }
        }
      });
    }

    // Generate some sample historical data for demonstration
    this.generateSampleData();
  }

  generateSampleData() {
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Generate realistic sample data with better patterns
      const timeOfDay = timestamp.getHours();
      const isRushHour = (timeOfDay >= 7 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 20);
      
      const baseAqi = 2 + Math.sin(i * 0.3) * 1.2 + (isRushHour ? 0.8 : 0) + Math.random() * 0.4;
      const basePm25 = 12 + Math.sin(i * 0.2) * 8 + (isRushHour ? 6 : 0) + Math.random() * 4;
      const baseTemp = 24 + Math.sin((24 - timeOfDay) * 0.26) * 6 + Math.random() * 2;
      const baseHumidity = 65 + Math.sin(i * 0.15) * 15 + Math.random() * 5;

      this.historicalData.aqi.push({
        timestamp,
        aqi: Math.max(1, Math.min(5, Math.round(baseAqi))),
        pm25: Math.max(0, Math.round(basePm25 * 100) / 100),
        pm10: Math.max(0, Math.round(basePm25 * 1.4 * 100) / 100),
        no2: Math.max(0, Math.round((8 + Math.random() * 12) * 100) / 100),
        o3: Math.max(0, Math.round((40 + Math.random() * 30) * 100) / 100)
      });

      this.historicalData.weather.push({
        timestamp,
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.max(20, Math.min(95, Math.round(baseHumidity))),
        pressure: Math.round(1013 + Math.sin(i * 0.1) * 8 + Math.random() * 4),
        wind_speed: Math.max(0, Math.round((2 + Math.random() * 6) * 10) / 10)
      });
    }

    this.updateCharts();
  }

  updateCharts() {
    if (!this.aqiChart || !this.weatherChart) return;

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
    const aqiLabels = filteredAqiData.map(d => {
      if (period === '24h') {
        return d.timestamp.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } else if (period === '7d') {
        return d.timestamp.toLocaleDateString('en-IN', { 
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
        });
      } else {
        return d.timestamp.toLocaleDateString('en-IN', { 
          month: 'short',
          day: 'numeric'
        });
      }
    });
    
    this.aqiChart.data.labels = aqiLabels;
    this.aqiChart.data.datasets[0].data = filteredAqiData.map(d => d.aqi);
    this.aqiChart.data.datasets[1].data = filteredAqiData.map(d => d.pm25);
    this.aqiChart.update('none');

    // Update Weather Chart
    const weatherLabels = filteredWeatherData.map(d => {
      if (period === '24h') {
        return d.timestamp.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } else if (period === '7d') {
        return d.timestamp.toLocaleDateString('en-IN', { 
          month: 'short',
          day: 'numeric',
          hour: '2-digit'
        });
      } else {
        return d.timestamp.toLocaleDateString('en-IN', { 
          month: 'short',
          day: 'numeric'
        });
      }
    });
    
    this.weatherChart.data.labels = weatherLabels;
    this.weatherChart.data.datasets[0].data = filteredWeatherData.map(d => d.temperature);
    this.weatherChart.data.datasets[1].data = filteredWeatherData.map(d => d.humidity);
    this.weatherChart.update('none');
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadCurrentData();
      });
    }

    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.target.dataset.period;
        if (period && period !== this.currentPeriod) {
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

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.loadCurrentData();
      }
    });
  }

  startAutoRefresh() {
    // Refresh data every 10 minutes
    setInterval(() => {
      if (!this.isLoading) {
        this.loadCurrentData();
      }
    }, 10 * 60 * 1000);
  }

  showError(message) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AirQualityApp();
});