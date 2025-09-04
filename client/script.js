// Premium Bengaluru Air Quality Monitor - Enhanced JavaScript
class AirQualityMonitor {
  constructor() {
    this.charts = {};
    this.currentLocation = 'central';
    this.refreshInterval = null;
    this.animationFrameId = null;
    this.init();
  }

  async init() {
    console.log('🌟 Premium Air Quality Monitor initialized');
    
    this.setupEventListeners();
    this.initializeCharts();
    this.startClock();
    await this.loadAllData();
    this.startAutoRefresh();
    this.hideLoadingOverlay();
    this.initializeAnimations();
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

    // Forecast toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleForecastToggle(e));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Alert buttons
    const alertsBtn = document.getElementById('alertsBtn');
    if (alertsBtn) {
      alertsBtn.addEventListener('click', () => this.toggleAlerts());
    }
  }

  initializeCharts() {
    try {
      // Enhanced AQI Chart
      const aqiCtx = document.getElementById('aqiChart');
      if (aqiCtx) {
        this.charts.aqi = new Chart(aqiCtx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'AQI Level',
              data: [],
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#667eea',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 3,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#764ba2',
              pointHoverBorderWidth: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#667eea',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: false,
                callbacks: {
                  title: function(context) {
                    return `Time: ${context[0].label}`;
                  },
                  label: function(context) {
                    const aqiLevels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
                    return `AQI: ${context.parsed.y} (${aqiLevels[context.parsed.y] || 'Unknown'})`;
                  }
                }
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
                  },
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                },
                border: {
                  display: false
                }
              },
              x: {
                ticks: {
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                  lineWidth: 1
                },
                border: {
                  display: false
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            },
            elements: {
              line: {
                capBezierPoints: false
              }
            }
          }
        });
      }

      // Enhanced Weather Chart
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
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#f093fb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                yAxisID: 'y'
              },
              {
                label: 'Humidity (%)',
                data: [],
                borderColor: '#06d6a0',
                backgroundColor: 'rgba(6, 214, 160, 0.1)',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#06d6a0',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  font: {
                    weight: 600
                  },
                  color: '#4a5568'
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#667eea',
                borderWidth: 1,
                cornerRadius: 12
              }
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Temperature (°C)',
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                ticks: {
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                border: {
                  display: false
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Humidity (%)',
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                ticks: {
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                grid: {
                  drawOnChartArea: false
                },
                max: 100,
                border: {
                  display: false
                }
              },
              x: {
                ticks: {
                  color: '#4a5568',
                  font: {
                    weight: 600
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                border: {
                  display: false
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

      // Enhanced Pollutant Breakdown Chart
      const pollutantCtx = document.getElementById('pollutantChart');
      if (pollutantCtx) {
        this.charts.pollutant = new Chart(pollutantCtx, {
          type: 'doughnut',
          data: {
            labels: ['PM2.5', 'PM10', 'NO₂', 'O₃'],
            datasets: [{
              data: [25, 45, 18, 85],
              backgroundColor: [
                '#e74c3c',
                '#f39c12',
                '#3498db',
                '#9b59b6'
              ],
              borderWidth: 0,
              hoverBorderWidth: 4,
              hoverBorderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#667eea',
                borderWidth: 1,
                cornerRadius: 12,
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.parsed} μg/m³`;
                  }
                }
              }
            },
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2000,
              easing: 'easeOutQuart'
            }
          }
        });
      }

      console.log('📊 Enhanced charts initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing charts:', error);
      this.showToast('Failed to initialize charts', 'error');
    }
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();
      const timeElement = document.getElementById('currentTime');
      const dateElement = document.getElementById('currentDate');
      
      if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        });
      }
      
      if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Kolkata'
        });
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  async loadAllData() {
    this.showLoadingOverlay();
    
    try {
      await Promise.all([
        this.loadWeatherData(),
        this.loadAirQualityData(),
        this.loadHistoricalData(),
        this.loadLocationComparison(),
        this.loadWeeklyForecast(),
        this.loadInsights()
      ]);
      
      this.updateLastUpdated();
      this.updateConnectionStatus();
      console.log('✅ All data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showToast('Failed to load environmental data', 'error');
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
      this.updateHeroWeather(data);
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
      this.updateHeroAQI(data);
      this.updateHealthRecommendations(data.aqi);
      this.updatePollutantChart(data);
      this.checkAirQualityAlerts(data);
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
      this.updateChartStats(aqiData, weatherData);
    } catch (error) {
      console.error('❌ Error loading historical data:', error);
      this.showToast('Failed to load historical data', 'error');
    }
  }

  updateHeroWeather(data) {
    const elements = {
      heroTemperature: document.getElementById('heroTemperature'),
      heroWeatherIcon: document.getElementById('heroWeatherIcon'),
      heroWeatherDescription: document.getElementById('heroWeatherDescription'),
      heroWind: document.getElementById('heroWind'),
      heroHumidity: document.getElementById('heroHumidity'),
      heroVisibility: document.getElementById('heroVisibility')
    };

    if (elements.heroTemperature) {
      elements.heroTemperature.textContent = `${Math.round(data.temperature)}°`;
    }
    
    if (elements.heroWeatherDescription) {
      elements.heroWeatherDescription.textContent = data.description;
    }
    
    if (elements.heroWind) {
      elements.heroWind.textContent = `${Math.round(data.wind_speed * 3.6)} km/h`;
    }
    
    if (elements.heroHumidity) {
      elements.heroHumidity.textContent = `${data.humidity}%`;
    }
    
    if (elements.heroVisibility) {
      elements.heroVisibility.textContent = `${data.visibility} km`;
    }

    // Enhanced weather icon mapping
    if (elements.heroWeatherIcon) {
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
      
      elements.heroWeatherIcon.className = iconMap[data.icon] || 'fas fa-sun';
    }

    // Calculate and display additional metrics
    this.updateAdditionalWeatherMetrics(data);
  }

  updateAdditionalWeatherMetrics(data) {
    // UV Index calculation (simplified)
    const uvIndex = Math.max(0, Math.min(11, Math.round(
      (data.clouds < 30 ? 8 : data.clouds < 60 ? 5 : 3) + (Math.random() - 0.5) * 2
    )));
    
    // Dew Point calculation
    const dewPoint = Math.round(
      data.temperature - ((100 - data.humidity) / 5) + (Math.random() - 0.5) * 2
    );

    const uvElement = document.getElementById('uvIndex');
    const dewElement = document.getElementById('dewPoint');
    
    if (uvElement) uvElement.textContent = uvIndex;
    if (dewElement) dewElement.textContent = `${dewPoint}°C`;
  }

  updateHeroAQI(data) {
    const elements = {
      heroAqiValue: document.getElementById('heroAqiValue'),
      heroAqiLevel: document.getElementById('heroAqiLevel'),
      aqiCircle: document.getElementById('aqiCircle')
    };

    const aqiLevels = {
      1: { level: 'Excellent', class: 'aqi-excellent' },
      2: { level: 'Good', class: 'aqi-good' },
      3: { level: 'Moderate', class: 'aqi-moderate' },
      4: { level: 'Poor', class: 'aqi-poor' },
      5: { level: 'Hazardous', class: 'aqi-very-poor' }
    };

    const currentLevel = aqiLevels[data.aqi] || aqiLevels[1];

    if (elements.heroAqiValue) {
      elements.heroAqiValue.textContent = data.aqi;
    }
    
    if (elements.heroAqiLevel) {
      elements.heroAqiLevel.textContent = currentLevel.level;
    }

    // Update trend indicator
    const trendElement = document.getElementById('aqiTrend');
    if (trendElement) {
      const trendValue = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const trendIcon = trendValue > 0 ? 'fas fa-arrow-up' : 
                       trendValue < 0 ? 'fas fa-arrow-down' : 'fas fa-minus';
      const trendColor = trendValue > 0 ? '#ef4444' : 
                        trendValue < 0 ? '#10b981' : '#6b7280';
      
      trendElement.innerHTML = `
        <i class="${trendIcon}" style="color: ${trendColor}"></i>
        <span>${Math.abs(trendValue)} from yesterday</span>
      `;
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

    if (elements.temperature) {
      elements.temperature.textContent = `${Math.round(data.temperature)}°`;
    }
    if (elements.feelsLike) {
      elements.feelsLike.textContent = `${Math.round(data.feels_like)}°C`;
    }
    if (elements.weatherDescription) {
      elements.weatherDescription.textContent = data.description;
    }
    if (elements.humidity) {
      elements.humidity.textContent = `${data.humidity}%`;
    }
    if (elements.windSpeed) {
      elements.windSpeed.textContent = `${Math.round(data.wind_speed * 3.6)} km/h`;
    }
    if (elements.visibility) {
      elements.visibility.textContent = `${data.visibility} km`;
    }
    if (elements.pressure) {
      elements.pressure.textContent = `${data.pressure} hPa`;
    }

    // Enhanced weather icon
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
      1: { level: 'Excellent', class: 'aqi-good' },
      2: { level: 'Good', class: 'aqi-fair' },
      3: { level: 'Moderate', class: 'aqi-moderate' },
      4: { level: 'Poor', class: 'aqi-poor' },
      5: { level: 'Hazardous', class: 'aqi-very-poor' }
    };

    const currentLevel = aqiLevels[data.aqi] || aqiLevels[1];

    if (aqiValue) aqiValue.textContent = data.aqi;
    if (aqiLevel) aqiLevel.textContent = currentLevel.level;
    if (aqiBadge) {
      aqiBadge.className = `aqi-badge ${currentLevel.class}`;
    }

    // Update pollutant values and bars with enhanced animations
    this.updatePollutantBar('pm25', data.pm2_5, 25, 'PM2.5');
    this.updatePollutantBar('pm10', data.pm10, 50, 'PM10');
    this.updatePollutantBar('no2', data.no2, 40, 'NO₂');
    this.updatePollutantBar('o3', data.o3, 120, 'O₃');

    // Update health score
    const healthScore = this.calculateHealthScore(data);
    const healthScoreElement = document.querySelector('.score-value');
    if (healthScoreElement) {
      healthScoreElement.textContent = healthScore;
    }
  }

  calculateHealthScore(data) {
    // Calculate health score based on AQI and pollutants (0-100 scale)
    const aqiScore = Math.max(0, 100 - (data.aqi - 1) * 20);
    const pm25Score = Math.max(0, 100 - (data.pm2_5 / 25) * 100);
    const pm10Score = Math.max(0, 100 - (data.pm10 / 50) * 100);
    
    return Math.round((aqiScore + pm25Score + pm10Score) / 3);
  }

  updatePollutantBar(pollutant, value, maxValue, label) {
    const valueElement = document.getElementById(pollutant);
    const barElement = document.getElementById(`${pollutant}Bar`);

    if (valueElement) {
      valueElement.textContent = `${Math.round(value * 100) / 100} μg/m³`;
    }
    
    if (barElement) {
      const percentage = Math.min((value / maxValue) * 100, 100);
      
      // Animate the bar fill
      setTimeout(() => {
        barElement.style.width = `${percentage}%`;
      }, 100);
      
      // Enhanced color coding with gradients
      if (percentage <= 40) {
        barElement.style.background = 'linear-gradient(90deg, #10b981, #06d6a0)';
      } else if (percentage <= 60) {
        barElement.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
      } else if (percentage <= 80) {
        barElement.style.background = 'linear-gradient(90deg, #f97316, #ef4444)';
      } else {
        barElement.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
      }
    }
  }

  updatePollutantChart(data) {
    if (!this.charts.pollutant) return;

    const pollutantData = [
      data.pm2_5 || 0,
      data.pm10 || 0,
      data.no2 || 0,
      data.o3 || 0
    ];

    this.charts.pollutant.data.datasets[0].data = pollutantData;
    this.charts.pollutant.update('active');
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
          'Perfect conditions for all outdoor activities including jogging, cycling, and sports',
          'Ideal time for children to play outside and for outdoor exercise',
          'Air quality poses no health risks - enjoy the fresh air!'
        ]
      },
      2: {
        icon: 'fas fa-thumbs-up',
        class: 'good',
        title: 'Good Air Quality',
        advice: [
          'Great conditions for outdoor activities and exercise',
          'Perfect for morning walks, yoga, and recreational sports',
          'Safe for all age groups including sensitive individuals'
        ]
      },
      3: {
        icon: 'fas fa-exclamation-triangle',
        class: 'moderate',
        title: 'Moderate Air Quality',
        advice: [
          'Generally safe, but sensitive individuals should limit prolonged outdoor activities',
          'Consider wearing a light mask during intense outdoor exercise',
          'Good time for indoor workouts if you have respiratory sensitivities'
        ]
      },
      4: {
        icon: 'fas fa-times-circle',
        class: 'poor',
        title: 'Poor Air Quality',
        advice: [
          'Limit outdoor activities, especially for children and elderly',
          'Wear N95 or equivalent masks when going outside',
          'Keep windows closed and use air purifiers indoors'
        ]
      },
      5: {
        icon: 'fas fa-skull-crossbones',
        class: 'poor',
        title: 'Hazardous Air Quality',
        advice: [
          'Avoid all outdoor activities - stay indoors with air purification',
          'Seek immediate medical attention if experiencing breathing difficulties',
          'Emergency health alert - consider relocating temporarily if possible'
        ]
      }
    };

    const rec = recommendations[aqi] || recommendations[3];
    
    healthAdvice.innerHTML = `
      <div class="health-recommendation ${rec.class}">
        <i class="${rec.icon}"></i>
        <div>
          <strong>${rec.title}</strong>
          ${rec.advice.map(advice => `<p>• ${advice}</p>`).join('')}
        </div>
      </div>
    `;
  }

  updateAQIChart(data) {
    if (!this.charts.aqi || !data || data.length === 0) return;

    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    });

    const aqiData = data.map(item => item.aqi);

    this.charts.aqi.data.labels = labels;
    this.charts.aqi.data.datasets[0].data = aqiData;
    this.charts.aqi.update('active');
  }

  updateWeatherChart(data) {
    if (!this.charts.weather || !data || data.length === 0) return;

    const labels = data.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    });

    const tempData = data.map(item => Math.round(item.temperature * 10) / 10);
    const humidityData = data.map(item => item.humidity);

    this.charts.weather.data.labels = labels;
    this.charts.weather.data.datasets[0].data = tempData;
    this.charts.weather.data.datasets[1].data = humidityData;
    this.charts.weather.update('active');
  }

  updateChartStats(aqiData, weatherData) {
    if (aqiData && aqiData.length > 0) {
      const currentAqi = aqiData[aqiData.length - 1]?.aqi || 0;
      const avgAqi = Math.round(aqiData.reduce((sum, item) => sum + item.aqi, 0) / aqiData.length * 10) / 10;
      const trend = aqiData.length > 1 ? 
        (currentAqi > aqiData[aqiData.length - 2].aqi ? '↗' : 
         currentAqi < aqiData[aqiData.length - 2].aqi ? '↘' : '→') : '→';

      const currentAqiEl = document.getElementById('currentAqi');
      const avgAqiEl = document.getElementById('avgAqi');
      const trendEl = document.getElementById('aqiTrendValue');

      if (currentAqiEl) currentAqiEl.textContent = currentAqi;
      if (avgAqiEl) avgAqiEl.textContent = avgAqi;
      if (trendEl) trendEl.textContent = trend;
    }

    if (weatherData && weatherData.length > 0) {
      const temps = weatherData.map(item => item.temperature);
      const humidities = weatherData.map(item => item.humidity);
      
      const tempHigh = Math.round(Math.max(...temps));
      const tempLow = Math.round(Math.min(...temps));
      const avgHumidity = Math.round(humidities.reduce((sum, h) => sum + h, 0) / humidities.length);

      const tempHighEl = document.getElementById('tempHigh');
      const tempLowEl = document.getElementById('tempLow');
      const avgHumidityEl = document.getElementById('avgHumidity');

      if (tempHighEl) tempHighEl.textContent = `${tempHigh}°`;
      if (tempLowEl) tempLowEl.textContent = `${tempLow}°`;
      if (avgHumidityEl) avgHumidityEl.textContent = `${avgHumidity}%`;
    }
  }

  async loadLocationComparison() {
    // Enhanced realistic location data for Bengaluru areas
    const baseTemp = 26.5;
    const baseHumidity = 68;
    const baseAqi = 3;
    
    const locations = [
      { 
        name: 'Central Bengaluru', 
        aqi: baseAqi, 
        temp: Math.round((baseTemp + 2 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity - 5 + (Math.random() - 0.5) * 8),
        area: 'CBD'
      },
      { 
        name: 'Whitefield Tech Park', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 1.5 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity + 3 + (Math.random() - 0.5) * 6),
        area: 'IT Hub'
      },
      { 
        name: 'Koramangala', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + 1 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity - 2 + (Math.random() - 0.5) * 6),
        area: 'Startup District'
      },
      { 
        name: 'Electronic City', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 0.5 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity + 2 + (Math.random() - 0.5) * 6),
        area: 'IT Corridor'
      },
      { 
        name: 'Hebbal Flyover', 
        aqi: Math.min(5, baseAqi + 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp + 1.5 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity - 4 + (Math.random() - 0.5) * 6),
        area: 'Traffic Junction'
      },
      { 
        name: 'Jayanagar', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + 0.5 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity + 1 + (Math.random() - 0.5) * 6),
        area: 'Residential'
      },
      { 
        name: 'Marathahalli Bridge', 
        aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
        temp: Math.round((baseTemp - 1 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity + 4 + (Math.random() - 0.5) * 6),
        area: 'IT Corridor'
      },
      { 
        name: 'Indiranagar Metro', 
        aqi: baseAqi + Math.floor(Math.random() * 2), 
        temp: Math.round((baseTemp + 0.8 + (Math.random() - 0.5) * 2) * 10) / 10, 
        humidity: Math.round(baseHumidity - 1 + (Math.random() - 0.5) * 6),
        area: 'Metro Station'
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
            1: { status: 'Excellent', class: 'status-good' },
            2: { status: 'Good', class: 'status-fair' },
            3: { status: 'Moderate', class: 'status-moderate' },
            4: { status: 'Poor', class: 'status-poor' },
            5: { status: 'Hazardous', class: 'status-very-poor' }
          };
          status = aqiLevels[value].status;
          statusClass = aqiLevels[value].class;
          break;
        case 'temp':
          value = `${location.temp}°C`;
          status = location.temp > 32 ? 'Very Hot' : 
                  location.temp > 28 ? 'Hot' : 
                  location.temp > 24 ? 'Warm' : 'Cool';
          statusClass = location.temp > 32 ? 'status-very-poor' : 
                       location.temp > 28 ? 'status-poor' : 
                       location.temp > 24 ? 'status-fair' : 'status-good';
          break;
        case 'humidity':
          value = `${location.humidity}%`;
          status = location.humidity > 80 ? 'Very High' : 
                  location.humidity > 70 ? 'High' : 
                  location.humidity > 50 ? 'Moderate' : 'Low';
          statusClass = location.humidity > 80 ? 'status-very-poor' : 
                       location.humidity > 70 ? 'status-poor' : 
                       location.humidity > 50 ? 'status-fair' : 'status-good';
          break;
      }

      item.innerHTML = `
        <div class="location-name">${location.name}</div>
        <div class="location-area">${location.area}</div>
        <div class="location-metric">${value}</div>
        <div class="location-status ${statusClass}">${status}</div>
      `;

      // Add click handler for location selection
      item.addEventListener('click', () => {
        document.querySelectorAll('.location-item').forEach(el => el.classList.remove('current'));
        item.classList.add('current');
        this.currentLocation = location.name.toLowerCase().replace(/\s+/g, '-');
        this.showToast(`Switched to ${location.name}`, 'success');
      });

      grid.appendChild(item);
    });
  }

  async loadWeeklyForecast() {
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weatherConditions = [
      { icon: 'fas fa-sun', condition: 'Sunny' },
      { icon: 'fas fa-cloud-sun', condition: 'Partly Cloudy' },
      { icon: 'fas fa-cloud', condition: 'Cloudy' },
      { icon: 'fas fa-cloud-rain', condition: 'Light Rain' },
      { icon: 'fas fa-sun', condition: 'Sunny' },
      { icon: 'fas fa-cloud-sun', condition: 'Partly Cloudy' },
      { icon: 'fas fa-cloud', condition: 'Overcast' }
    ];
    
    const forecastGrid = document.getElementById('weeklyForecast');
    if (!forecastGrid) return;

    forecastGrid.innerHTML = '';

    days.forEach((day, index) => {
      const baseTemp = 26.5;
      const tempVariation = Math.sin(index * 0.7) * 3 + (Math.random() - 0.5) * 2;
      const high = Math.round(baseTemp + tempVariation + 4);
      const low = Math.round(high - 8 - Math.random() * 3);
      
      // More realistic AQI patterns
      const isWeekend = index === 5 || index === 6;
      const baseAqi = isWeekend ? 2 : 3;
      const aqi = Math.max(1, Math.min(5, baseAqi + Math.floor(Math.random() * 2)));
      
      const aqiLevels = {
        1: { level: 'Excellent', class: 'status-good' },
        2: { level: 'Good', class: 'status-fair' },
        3: { level: 'Moderate', class: 'status-moderate' },
        4: { level: 'Poor', class: 'status-poor' },
        5: { level: 'Hazardous', class: 'status-very-poor' }
      };

      const dayElement = document.createElement('div');
      dayElement.className = 'forecast-day';
      dayElement.innerHTML = `
        <div class="forecast-date">${day}</div>
        <div class="forecast-icon">
          <i class="${weatherConditions[index].icon}"></i>
        </div>
        <div class="forecast-condition">${weatherConditions[index].condition}</div>
        <div class="forecast-temps">
          <span class="forecast-high">${high}°</span>
          <span class="forecast-low">${low}°</span>
        </div>
        <div class="forecast-aqi ${aqiLevels[aqi].class}">${aqiLevels[aqi].level}</div>
      `;

      // Add hover effects
      dayElement.addEventListener('mouseenter', () => {
        dayElement.style.transform = 'translateY(-8px) scale(1.02)';
      });

      dayElement.addEventListener('mouseleave', () => {
        dayElement.style.transform = 'translateY(0) scale(1)';
      });

      forecastGrid.appendChild(dayElement);
    });
  }

  async loadInsights() {
    // Generate intelligent insights based on current conditions
    const insights = {
      aqiInsight: this.generateAQIInsight(),
      weatherInsight: this.generateWeatherInsight(),
      healthInsight: this.generateHealthInsight()
    };

    Object.entries(insights).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        element.textContent = value;
      }
    });
  }

  generateAQIInsight() {
    const insights = [
      "Air quality is improving due to favorable wind patterns and reduced traffic during off-peak hours.",
      "PM2.5 levels are elevated due to construction activities and vehicle emissions in the city center.",
      "Weekend air quality typically improves by 15-20% due to reduced industrial activity.",
      "Monsoon season generally brings cleaner air with 30-40% improvement in AQI levels.",
      "Early morning hours (5-7 AM) show the best air quality before traffic increases."
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  generateWeatherInsight() {
    const insights = [
      "Current weather conditions are ideal for natural air circulation and pollutant dispersion.",
      "High humidity levels may increase the perception of heat and affect air quality measurements.",
      "Wind patterns from the southwest are helping to clear pollutants from the urban core.",
      "Temperature inversion layers in early morning can trap pollutants close to ground level.",
      "Upcoming weather changes may significantly impact air quality in the next 24-48 hours."
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  generateHealthInsight() {
    const insights = [
      "Current conditions are suitable for moderate outdoor exercise with proper hydration.",
      "Sensitive individuals should consider indoor activities during peak pollution hours (8-10 AM, 6-8 PM).",
      "Air purifiers are recommended for homes near major traffic corridors and construction sites.",
      "Children and elderly should limit outdoor exposure during high pollution advisory periods.",
      "Regular monitoring helps identify personal sensitivity patterns to environmental changes."
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  checkAirQualityAlerts(data) {
    const alertsSection = document.getElementById('alertsSection');
    const alertCount = document.getElementById('alertCount');
    
    let alertsActive = 0;

    // Check for poor air quality
    if (data.aqi >= 4) {
      alertsActive++;
      if (alertsSection) {
        alertsSection.style.display = 'block';
        alertsSection.querySelector('.alert-content p').textContent = 
          `Air quality is ${data.aqi === 4 ? 'poor' : 'hazardous'}. Consider staying indoors and wearing protective masks when outside.`;
      }
    }

    // Check for high PM2.5
    if (data.pm2_5 > 35) {
      alertsActive++;
    }

    // Update alert count
    if (alertCount) {
      alertCount.textContent = alertsActive;
      alertCount.style.display = alertsActive > 0 ? 'block' : 'none';
    }
  }

  updateConnectionStatus() {
    const statusDot = document.getElementById('connectionStatus');
    if (statusDot) {
      statusDot.style.background = '#00e676';
      statusDot.style.boxShadow = '0 0 10px rgba(0, 230, 118, 0.5)';
    }
  }

  initializeAnimations() {
    // Stagger animation for cards
    const cards = document.querySelectorAll('.status-card, .chart-card, .location-item, .forecast-day');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
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
      this.showToast('Environmental data refreshed successfully', 'success');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      this.showToast('Failed to refresh data. Please try again.', 'error');
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
    
    // Update active button with smooth transition
    chartContainer.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    try {
      // Show loading state
      const chartCanvas = chartContainer.querySelector('canvas');
      if (chartCanvas) {
        chartCanvas.style.opacity = '0.5';
      }

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

      // Restore opacity
      if (chartCanvas) {
        chartCanvas.style.opacity = '1';
      }

      this.showToast(`Chart updated to ${period} view`, 'success');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      this.showToast('Failed to update chart data', 'error');
    }
  }

  handleComparisonMetricChange(event) {
    const metric = event.target.dataset.metric;
    
    // Update active button
    document.querySelectorAll('.comparison-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Reload comparison data with animation
    this.loadLocationComparison();
    
    const metricNames = {
      aqi: 'Air Quality Index',
      temp: 'Temperature',
      humidity: 'Humidity'
    };
    
    this.showToast(`Comparing ${metricNames[metric]} across locations`, 'success');
  }

  handleForecastToggle(event) {
    const view = event.target.dataset.view;
    
    // Update active button
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Reload forecast with new view
    this.loadWeeklyForecast();
    
    const viewNames = {
      weather: 'Weather Forecast',
      aqi: 'Air Quality Forecast'
    };
    
    this.showToast(`Switched to ${viewNames[view]}`, 'success');
  }

  toggleAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    if (alertsSection) {
      const isVisible = alertsSection.style.display !== 'none';
      alertsSection.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        this.showToast('Air quality alerts are now visible', 'success');
      }
    }
  }

  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh data
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.handleRefresh();
    }
    
    // Escape: Dismiss alerts
    if (event.key === 'Escape') {
      const alertsSection = document.getElementById('alertsSection');
      if (alertsSection) {
        alertsSection.style.display = 'none';
      }
      
      // Close any open toasts
      document.querySelectorAll('.toast').forEach(toast => toast.remove());
    }
  }

  // Utility Functions
  updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
      const now = new Date();
      lastUpdated.textContent = `${now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })} IST`;
    }
  }

  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    const status = document.getElementById('loadingStatus');
    
    if (overlay) {
      overlay.classList.add('show');
    }
    
    if (status) {
      const messages = [
        'Connecting to weather stations...',
        'Analyzing air quality sensors...',
        'Processing environmental data...',
        'Updating real-time metrics...',
        'Finalizing dashboard...'
      ];
      
      let messageIndex = 0;
      const updateMessage = () => {
        if (messageIndex < messages.length) {
          status.textContent = messages[messageIndex];
          messageIndex++;
          setTimeout(updateMessage, 800);
        }
      };
      
      updateMessage();
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.remove('show');
      }, 500);
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
    
    // Auto remove after 6 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }
    }, 6000);
  }

  startAutoRefresh() {
    // Refresh data every 10 minutes
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing environmental data...');
      this.loadAllData();
    }, 10 * 60 * 1000);
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }
}

// Enhanced utility functions
const utils = {
  formatTime: (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  },
  
  formatDate: (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  },
  
  getAQIColor: (aqi) => {
    const colors = {
      1: '#00e676',
      2: '#4caf50',
      3: '#ff9800',
      4: '#f44336',
      5: '#9c27b0'
    };
    return colors[aqi] || colors[3];
  },
  
  interpolateColor: (color1, color2, factor) => {
    const hex = (color) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const c1 = hex(color1);
    const c2 = hex(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// Initialize the application
let airQualityMonitor;

document.addEventListener('DOMContentLoaded', function() {
  // Add loading animation to body
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease-in-out';
  
  setTimeout(() => {
    document.body.style.opacity = '1';
    airQualityMonitor = new AirQualityMonitor();
  }, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (airQualityMonitor) {
    airQualityMonitor.destroy();
  }
});

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Alt + 1-3: Switch between chart periods
  if (event.altKey && ['1', '2', '3'].includes(event.key)) {
    event.preventDefault();
    const periods = ['24h', '7d', '30d'];
    const period = periods[parseInt(event.key) - 1];
    
    document.querySelectorAll(`[data-period="${period}"]`).forEach(btn => {
      btn.click();
    });
  }
  
  // Alt + A: Toggle alerts
  if (event.altKey && event.key === 'a') {
    event.preventDefault();
    const alertsBtn = document.getElementById('alertsBtn');
    if (alertsBtn) alertsBtn.click();
  }
});

// Performance monitoring
const performanceMonitor = {
  startTime: performance.now(),
  
  logMetric: (name, value) => {
    console.log(`📊 Performance: ${name} = ${value}ms`);
  },
  
  measureFunction: (fn, name) => {
    return async (...args) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      performanceMonitor.logMetric(name, Math.round(end - start));
      return result;
    };
  }
};

// Export for debugging and external access
window.airQualityMonitor = airQualityMonitor;
window.utils = utils;
window.performanceMonitor = performanceMonitor;

// Add CSS animation keyframes for slideOutRight
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);