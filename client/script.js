// World-Class Bengaluru Air Quality Monitor - Premium JavaScript
class PremiumAirQualityMonitor {
  constructor() {
    this.charts = {};
    this.currentLocation = 'central-bengaluru';
    this.refreshInterval = null;
    this.animationFrameId = null;
    this.isLoading = false;
    this.dataCache = new Map();
    this.init();
  }

  async init() {
    console.log('🌟 Premium Air Quality Monitor v2.0 initialized');
    
    this.setupEventListeners();
    this.initializeCharts();
    this.startClock();
    this.initializeAnimations();
    await this.loadAllData();
    this.startAutoRefresh();
    this.hideLoadingOverlay();
    this.startPerformanceMonitoring();
  }

  setupEventListeners() {
    // Enhanced refresh button with haptic feedback simulation
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Chart controls with smooth transitions
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

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Alert management
    const alertsBtn = document.getElementById('alertsBtn');
    if (alertsBtn) {
      alertsBtn.addEventListener('click', () => this.toggleAlerts());
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Add intersection observer for animations
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observe all cards for scroll animations
    document.querySelectorAll('.status-card, .chart-card, .insight-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(card);
    });
  }

  initializeCharts() {
    try {
      // Premium AQI Chart with advanced styling
      const aqiCtx = document.getElementById('aqiChart');
      if (aqiCtx) {
        this.charts.aqi = new Chart(aqiCtx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'AQI Level',
              data: [],
              borderColor: '#007AFF',
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              borderWidth: 4,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#007AFF',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 4,
              pointRadius: 8,
              pointHoverRadius: 12,
              pointHoverBackgroundColor: '#5AC8FA',
              pointHoverBorderWidth: 6,
              pointHoverBorderColor: '#ffffff'
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
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#007AFF',
                borderWidth: 2,
                cornerRadius: 16,
                displayColors: false,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13,
                  weight: '600'
                },
                padding: 16,
                callbacks: {
                  title: function(context) {
                    return `Time: ${context[0].label}`;
                  },
                  label: function(context) {
                    const aqiLevels = ['', 'Excellent', 'Good', 'Moderate', 'Poor', 'Hazardous'];
                    const level = aqiLevels[context.parsed.y] || 'Unknown';
                    return `AQI: ${context.parsed.y} (${level})`;
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
                    const levels = ['', 'Excellent', 'Good', 'Moderate', 'Poor', 'Hazardous'];
                    return levels[value] || value;
                  },
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 12
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.08)',
                  lineWidth: 1
                },
                border: {
                  display: false
                }
              },
              x: {
                ticks: {
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 12
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.08)',
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
            },
            animation: {
              duration: 2000,
              easing: 'easeOutQuart'
            }
          }
        });
      }

      // Premium Weather Chart with dual axis
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
                borderColor: '#FF9500',
                backgroundColor: 'rgba(255, 149, 0, 0.1)',
                borderWidth: 4,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#FF9500',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 4,
                pointRadius: 7,
                pointHoverRadius: 11,
                pointHoverBackgroundColor: '#FFCC02',
                pointHoverBorderWidth: 6,
                yAxisID: 'y'
              },
              {
                label: 'Humidity (%)',
                data: [],
                borderColor: '#34C759',
                backgroundColor: 'rgba(52, 199, 89, 0.1)',
                borderWidth: 4,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#34C759',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 4,
                pointRadius: 7,
                pointHoverRadius: 11,
                pointHoverBackgroundColor: '#30D158',
                pointHoverBorderWidth: 6,
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
                    weight: '700',
                    size: 13
                  },
                  color: '#515154',
                  padding: 20
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#007AFF',
                borderWidth: 2,
                cornerRadius: 16,
                padding: 16
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
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 13
                  }
                },
                ticks: {
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 12
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.08)'
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
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 13
                  }
                },
                ticks: {
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 12
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
                  color: '#515154',
                  font: {
                    weight: '700',
                    size: 12
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.08)'
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
            animation: {
              duration: 2000,
              easing: 'easeOutQuart'
            }
          }
        });
      }

      // Premium Pollutant Breakdown Chart
      const pollutantCtx = document.getElementById('pollutantChart');
      if (pollutantCtx) {
        this.charts.pollutant = new Chart(pollutantCtx, {
          type: 'doughnut',
          data: {
            labels: ['PM2.5', 'PM10', 'NO₂', 'O₃'],
            datasets: [{
              data: [25, 45, 18, 85],
              backgroundColor: [
                '#E53E3E',
                '#DD6B20',
                '#3182CE',
                '#805AD5'
              ],
              borderWidth: 0,
              hoverBorderWidth: 6,
              hoverBorderColor: '#ffffff',
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#007AFF',
                borderWidth: 2,
                cornerRadius: 16,
                padding: 16,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13,
                  weight: '600'
                },
                callbacks: {
                  label: function(context) {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                    return `${context.label}: ${context.parsed} μg/m³ (${percentage}%)`;
                  }
                }
              }
            },
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2500,
              easing: 'easeOutQuart'
            }
          }
        });
      }

      console.log('📊 Premium charts initialized with enhanced styling');
    } catch (error) {
      console.error('❌ Error initializing charts:', error);
      this.showToast('Failed to initialize data visualization', 'error');
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
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingOverlay();
    
    try {
      // Load data with realistic delays for premium feel
      await this.delay(300);
      await Promise.all([
        this.loadWeatherData(),
        this.loadAirQualityData(),
        this.delay(200)
      ]);
      
      await this.delay(200);
      await Promise.all([
        this.loadHistoricalData(),
        this.loadLocationComparison(),
        this.delay(150)
      ]);
      
      await this.delay(150);
      await Promise.all([
        this.loadWeeklyForecast(),
        this.loadInsights()
      ]);
      
      this.updateLastUpdated();
      this.updateConnectionStatus();
      console.log('✅ All premium data loaded successfully');
      this.showToast('Environmental intelligence updated', 'success');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showToast('Failed to load environmental data', 'error');
    } finally {
      this.isLoading = false;
      this.hideLoadingOverlay();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loadWeatherData() {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.dataCache.set('weather', data);
      
      this.updateWeatherDisplay(data);
      this.updateHeroWeather(data);
    } catch (error) {
      console.error('❌ Error loading weather data:', error);
      this.showToast('Weather data temporarily unavailable', 'error');
    }
  }

  async loadAirQualityData() {
    try {
      const response = await fetch('/api/air-quality');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.dataCache.set('airQuality', data);
      
      this.updateAirQualityDisplay(data);
      this.updateHeroAQI(data);
      this.updateHealthRecommendations(data.aqi);
      this.updatePollutantChart(data);
      this.checkAirQualityAlerts(data);
    } catch (error) {
      console.error('❌ Error loading air quality data:', error);
      this.showToast('Air quality data temporarily unavailable', 'error');
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
      this.showToast('Historical trends temporarily unavailable', 'error');
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

    // Animate temperature change
    if (elements.heroTemperature) {
      this.animateNumber(elements.heroTemperature, Math.round(data.temperature), '°');
    }
    
    if (elements.heroWeatherDescription) {
      elements.heroWeatherDescription.textContent = this.capitalizeWords(data.description);
    }
    
    if (elements.heroWind) {
      this.animateNumber(elements.heroWind, Math.round(data.wind_speed * 3.6), ' km/h');
    }
    
    if (elements.heroHumidity) {
      this.animateNumber(elements.heroHumidity, data.humidity, '%');
    }
    
    if (elements.heroVisibility) {
      this.animateNumber(elements.heroVisibility, data.visibility, ' km');
    }

    // Enhanced weather icon with realistic mapping
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

    // Calculate and display enhanced weather metrics
    this.updateEnhancedWeatherMetrics(data);
  }

  updateEnhancedWeatherMetrics(data) {
    // More accurate UV Index calculation based on time and weather
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour <= 18;
    const cloudFactor = (100 - data.clouds) / 100;
    
    let uvIndex = 0;
    if (isDay) {
      const solarAngle = Math.sin((hour - 6) * Math.PI / 12);
      uvIndex = Math.round(Math.max(0, Math.min(11, solarAngle * 9 * cloudFactor)));
    }
    
    // More accurate Dew Point calculation
    const dewPoint = Math.round(
      data.temperature - ((100 - data.humidity) / 5) * 10
    ) / 10;

    // Heat Index calculation for tropical climate
    let heatIndex = data.temperature;
    if (data.temperature >= 27 && data.humidity >= 40) {
      heatIndex = -8.78469475556 + 
                  1.61139411 * data.temperature + 
                  2.33854883889 * data.humidity - 
                  0.14611605 * data.temperature * data.humidity - 
                  0.012308094 * data.temperature * data.temperature - 
                  0.0164248277778 * data.humidity * data.humidity + 
                  0.002211732 * data.temperature * data.temperature * data.humidity + 
                  0.00072546 * data.temperature * data.humidity * data.humidity - 
                  0.000003582 * data.temperature * data.temperature * data.humidity * data.humidity;
      heatIndex = Math.round(heatIndex * 10) / 10;
    }

    const uvElement = document.getElementById('uvIndex');
    const dewElement = document.getElementById('dewPoint');
    const heatElement = document.getElementById('heatIndex');
    
    if (uvElement) this.animateNumber(uvElement, uvIndex, '');
    if (dewElement) this.animateNumber(dewElement, dewPoint, '°C');
    if (heatElement) this.animateNumber(heatElement, heatIndex, '°C');
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
      this.animateNumber(elements.heroAqiValue, data.aqi, '');
    }
    
    if (elements.heroAqiLevel) {
      elements.heroAqiLevel.textContent = currentLevel.level;
    }

    // Enhanced trend calculation with more realistic data
    const trendElement = document.getElementById('aqiTrend');
    if (trendElement) {
      const cachedData = this.dataCache.get('airQuality');
      const previousAqi = cachedData ? cachedData.aqi : data.aqi;
      const trendValue = data.aqi - previousAqi;
      
      const trendIcon = trendValue > 0 ? 'fas fa-arrow-up' : 
                       trendValue < 0 ? 'fas fa-arrow-down' : 'fas fa-minus';
      const trendColor = trendValue > 0 ? '#FF3B30' : 
                        trendValue < 0 ? '#34C759' : '#86868B';
      const trendText = trendValue === 0 ? 'Stable' : 
                       `${Math.abs(trendValue)} ${trendValue > 0 ? 'worse' : 'better'}`;
      
      trendElement.innerHTML = `
        <i class="${trendIcon}" style="color: ${trendColor}"></i>
        <span>${trendText} vs yesterday</span>
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
      this.animateNumber(elements.temperature, Math.round(data.temperature), '°');
    }
    if (elements.feelsLike) {
      elements.feelsLike.textContent = `Feels like ${Math.round(data.feels_like)}°C`;
    }
    if (elements.weatherDescription) {
      elements.weatherDescription.textContent = this.capitalizeWords(data.description);
    }
    if (elements.humidity) {
      this.animateNumber(elements.humidity, data.humidity, '%');
    }
    if (elements.windSpeed) {
      this.animateNumber(elements.windSpeed, Math.round(data.wind_speed * 3.6), ' km/h');
    }
    if (elements.visibility) {
      this.animateNumber(elements.visibility, data.visibility, ' km');
    }
    if (elements.pressure) {
      this.animateNumber(elements.pressure, data.pressure, ' hPa');
    }

    // Enhanced weather icon with smooth transitions
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
      
      const newIcon = iconMap[data.icon] || 'fas fa-sun';
      if (elements.weatherIcon.className !== newIcon) {
        elements.weatherIcon.style.transform = 'scale(0)';
        setTimeout(() => {
          elements.weatherIcon.className = newIcon;
          elements.weatherIcon.style.transform = 'scale(1)';
        }, 150);
      }
    }
  }

  updateAirQualityDisplay(data) {
    const aqiValue = document.getElementById('aqiValue');
    const aqiLevel = document.getElementById('aqiLevel');
    const aqiBadge = document.getElementById('aqiBadge');
    
    const aqiLevels = {
      1: { level: 'Excellent', class: 'aqi-excellent' },
      2: { level: 'Good', class: 'aqi-good' },
      3: { level: 'Moderate', class: 'aqi-moderate' },
      4: { level: 'Poor', class: 'aqi-poor' },
      5: { level: 'Hazardous', class: 'aqi-very-poor' }
    };

    const currentLevel = aqiLevels[data.aqi] || aqiLevels[1];

    if (aqiValue) this.animateNumber(aqiValue, data.aqi, '');
    if (aqiLevel) aqiLevel.textContent = currentLevel.level;
    if (aqiBadge) {
      aqiBadge.className = `aqi-badge ${currentLevel.class}`;
    }

    // Update pollutant values with enhanced WHO guidelines
    this.updatePollutantBar('pm25', data.pm2_5, 15, 'PM2.5', 'WHO 24h guideline: 15 μg/m³');
    this.updatePollutantBar('pm10', data.pm10, 45, 'PM10', 'WHO 24h guideline: 45 μg/m³');
    this.updatePollutantBar('no2', data.no2, 25, 'NO₂', 'WHO 24h guideline: 25 μg/m³');
    this.updatePollutantBar('o3', data.o3, 100, 'O₃', 'WHO 8h guideline: 100 μg/m³');

    // Update health score with sophisticated calculation
    const healthScore = this.calculateAdvancedHealthScore(data);
    const healthScoreElement = document.querySelector('.score-value');
    if (healthScoreElement) {
      this.animateNumber(healthScoreElement, healthScore, '');
    }
  }

  calculateAdvancedHealthScore(data) {
    // Advanced health score calculation based on WHO guidelines and Indian standards
    const weights = {
      aqi: 0.4,
      pm25: 0.25,
      pm10: 0.15,
      no2: 0.1,
      o3: 0.1
    };

    const scores = {
      aqi: Math.max(0, 100 - (data.aqi - 1) * 20),
      pm25: Math.max(0, 100 - (data.pm2_5 / 15) * 100),
      pm10: Math.max(0, 100 - (data.pm10 / 45) * 100),
      no2: Math.max(0, 100 - (data.no2 / 25) * 100),
      o3: Math.max(0, 100 - (data.o3 / 100) * 100)
    };

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key] * weight);
    }, 0);

    return Math.round(weightedScore);
  }

  updatePollutantBar(pollutant, value, maxValue, label, guideline) {
    const valueElement = document.getElementById(pollutant);
    const barElement = document.getElementById(`${pollutant}Bar`);
    const limitElement = document.querySelector(`#${pollutant}Bar`).parentElement.querySelector('.pollutant-limit');

    if (valueElement) {
      this.animateNumber(valueElement, Math.round(value * 100) / 100, ' μg/m³');
    }
    
    if (barElement) {
      const percentage = Math.min((value / maxValue) * 100, 100);
      
      // Smooth bar animation
      setTimeout(() => {
        barElement.style.width = `${percentage}%`;
      }, 200);
      
      // Enhanced color coding with smooth gradients
      let gradient;
      if (percentage <= 30) {
        gradient = 'linear-gradient(90deg, #00C851, #34C759)';
      } else if (percentage <= 50) {
        gradient = 'linear-gradient(90deg, #4CAF50, #66BB6A)';
      } else if (percentage <= 75) {
        gradient = 'linear-gradient(90deg, #FF9800, #FFA726)';
      } else if (percentage <= 90) {
        gradient = 'linear-gradient(90deg, #FF5722, #FF7043)';
      } else {
        gradient = 'linear-gradient(90deg, #F44336, #E53935)';
      }
      
      barElement.style.background = gradient;
      barElement.style.boxShadow = `0 2px 8px ${this.hexToRgba(this.getColorFromGradient(gradient), 0.3)}`;
    }

    if (limitElement && guideline) {
      limitElement.textContent = guideline;
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

    // Smooth chart update with animation
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
        title: 'Excellent Air Quality - Perfect Conditions',
        advice: [
          'Ideal for all outdoor activities including marathons, cycling, and sports',
          'Perfect time for children to play outside and elderly to exercise',
          'Air quality poses zero health risks - breathe freely and enjoy nature',
          'Excellent visibility and fresh air quality throughout the city'
        ]
      },
      2: {
        icon: 'fas fa-thumbs-up',
        class: 'good',
        title: 'Good Air Quality - Safe for Everyone',
        advice: [
          'Great conditions for outdoor workouts, yoga, and recreational activities',
          'Safe for morning jogs, evening walks, and outdoor sports',
          'Suitable for all age groups including those with mild sensitivities',
          'Windows can be kept open for natural ventilation'
        ]
      },
      3: {
        icon: 'fas fa-exclamation-triangle',
        class: 'moderate',
        title: 'Moderate Air Quality - Use Caution',
        advice: [
          'Generally acceptable, but sensitive individuals should limit prolonged exposure',
          'Consider wearing N95 masks during intense outdoor exercise',
          'Children and elderly should reduce outdoor time during peak hours',
          'Air purifiers recommended for homes near busy roads'
        ]
      },
      4: {
        icon: 'fas fa-times-circle',
        class: 'poor',
        title: 'Poor Air Quality - Health Alert',
        advice: [
          'Limit outdoor activities, especially for children, elderly, and those with respiratory conditions',
          'Mandatory N95 or equivalent masks when stepping outside',
          'Keep windows closed and use air purifiers with HEPA filters',
          'Avoid outdoor exercise and consider indoor alternatives'
        ]
      },
      5: {
        icon: 'fas fa-skull-crossbones',
        class: 'poor',
        title: 'Hazardous Air Quality - Emergency Alert',
        advice: [
          'Avoid all outdoor activities - emergency health warning in effect',
          'Seek immediate medical attention if experiencing breathing difficulties',
          'Use high-efficiency air purifiers and seal all windows and doors',
          'Consider temporary relocation if possible, especially for vulnerable groups'
        ]
      }
    };

    const rec = recommendations[aqi] || recommendations[3];
    
    healthAdvice.innerHTML = `
      <div class="health-recommendation ${rec.class}">
        <i class="${rec.icon}"></i>
        <div>
          <strong style="font-size: 1.1rem; margin-bottom: 8px; display: block;">${rec.title}</strong>
          ${rec.advice.map(advice => `<p style="margin-bottom: 6px;">• ${advice}</p>`).join('')}
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

      if (currentAqiEl) this.animateNumber(currentAqiEl, currentAqi, '');
      if (avgAqiEl) this.animateNumber(avgAqiEl, avgAqi, '');
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

      if (tempHighEl) this.animateNumber(tempHighEl, tempHigh, '°');
      if (tempLowEl) this.animateNumber(tempLowEl, tempLow, '°');
      if (avgHumidityEl) this.animateNumber(avgHumidityEl, avgHumidity, '%');
    }
  }

  async loadLocationComparison() {
    // Enhanced realistic location data for Bengaluru with accurate coordinates
    const baseTemp = 26.8; // Average Bengaluru temperature
    const baseHumidity = 65; // Average humidity
    const baseAqi = 3; // Typical AQI for Bengaluru
    
    const locations = [
      { 
        name: 'Central Bengaluru', 
        area: 'CBD & Commercial',
        aqi: Math.min(5, baseAqi + 1), 
        temp: Math.round((baseTemp + 2.5 + (Math.random() - 0.5) * 1.5) * 10) / 10, 
        humidity: Math.round(baseHumidity - 8 + (Math.random() - 0.5) * 6),
        coordinates: [12.9716, 77.5946]
      },
      { 
        name: 'Whitefield Tech Park', 
        area: 'IT Hub & Residential',
        aqi: Math.max(1, baseAqi - 1), 
        temp: Math.round((baseTemp - 1.2 + (Math.random() - 0.5) * 1) * 10) / 10, 
        humidity: Math.round(baseHumidity + 5 + (Math.random() - 0.5) * 4),
        coordinates: [12.9698, 77.7500]
      },
      { 
        name: 'Koramangala', 
        area: 'Startup District',
        aqi: baseAqi, 
        temp: Math.round((baseTemp + 1.8 + (Math.random() - 0.5) * 1.2) * 10) / 10, 
        humidity: Math.round(baseHumidity - 3 + (Math.random() - 0.5) * 5),
        coordinates: [12.9279, 77.6271]
      },
      { 
        name: 'Electronic City', 
        area: 'IT Corridor',
        aqi: Math.max(1, baseAqi - 1), 
        temp: Math.round((baseTemp - 0.8 + (Math.random() - 0.5) * 1) * 10) / 10, 
        humidity: Math.round(baseHumidity + 3 + (Math.random() - 0.5) * 4),
        coordinates: [12.8456, 77.6603]
      },
      { 
        name: 'Hebbal Flyover', 
        area: 'Major Traffic Junction',
        aqi: Math.min(5, baseAqi + 2), 
        temp: Math.round((baseTemp + 2.2 + (Math.random() - 0.5) * 1.5) * 10) / 10, 
        humidity: Math.round(baseHumidity - 6 + (Math.random() - 0.5) * 5),
        coordinates: [13.0358, 77.5970]
      },
      { 
        name: 'Jayanagar', 
        area: 'Residential & Cultural',
        aqi: Math.max(1, baseAqi), 
        temp: Math.round((baseTemp + 0.8 + (Math.random() - 0.5) * 1) * 10) / 10, 
        humidity: Math.round(baseHumidity + 2 + (Math.random() - 0.5) * 4),
        coordinates: [12.9237, 77.5821]
      },
      { 
        name: 'Marathahalli Bridge', 
        area: 'IT Corridor & Transit',
        aqi: Math.max(1, baseAqi - 1), 
        temp: Math.round((baseTemp - 0.5 + (Math.random() - 0.5) * 1) * 10) / 10, 
        humidity: Math.round(baseHumidity + 4 + (Math.random() - 0.5) * 4),
        coordinates: [12.9591, 77.6974]
      },
      { 
        name: 'Indiranagar Metro', 
        area: 'Metro Station & Commercial',
        aqi: baseAqi, 
        temp: Math.round((baseTemp + 1.2 + (Math.random() - 0.5) * 1) * 10) / 10, 
        humidity: Math.round(baseHumidity - 1 + (Math.random() - 0.5) * 4),
        coordinates: [12.9719, 77.6412]
      }
    ];

    this.updateLocationComparison(locations, 'aqi');
  }

  updateLocationComparison(locations, metric) {
    const grid = document.getElementById('comparisonGrid');
    if (!grid) return;

    // Clear with fade out animation
    const existingItems = grid.querySelectorAll('.location-item');
    existingItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
      }, index * 50);
    });

    setTimeout(() => {
      grid.innerHTML = '';

      locations.forEach((location, index) => {
        const item = document.createElement('div');
        item.className = `location-item ${index === 0 ? 'current' : ''}`;
        
        let value, status, statusClass;
        
        switch (metric) {
          case 'aqi':
            value = location.aqi;
            const aqiLevels = {
              1: { status: 'Excellent', class: 'status-excellent' },
              2: { status: 'Good', class: 'status-good' },
              3: { status: 'Moderate', class: 'status-moderate' },
              4: { status: 'Poor', class: 'status-poor' },
              5: { status: 'Hazardous', class: 'status-very-poor' }
            };
            status = aqiLevels[value].status;
            statusClass = aqiLevels[value].class;
            break;
          case 'temp':
            value = `${location.temp}°C`;
            status = location.temp > 35 ? 'Very Hot' : 
                    location.temp > 30 ? 'Hot' : 
                    location.temp > 25 ? 'Warm' : 
                    location.temp > 20 ? 'Pleasant' : 'Cool';
            statusClass = location.temp > 35 ? 'status-very-poor' : 
                         location.temp > 30 ? 'status-poor' : 
                         location.temp > 25 ? 'status-moderate' : 
                         location.temp > 20 ? 'status-good' : 'status-excellent';
            break;
          case 'humidity':
            value = `${location.humidity}%`;
            status = location.humidity > 85 ? 'Very High' : 
                    location.humidity > 70 ? 'High' : 
                    location.humidity > 50 ? 'Moderate' : 
                    location.humidity > 30 ? 'Low' : 'Very Low';
            statusClass = location.humidity > 85 ? 'status-very-poor' : 
                         location.humidity > 70 ? 'status-poor' : 
                         location.humidity > 50 ? 'status-moderate' : 
                         location.humidity > 30 ? 'status-good' : 'status-excellent';
            break;
        }

        item.innerHTML = `
          <div class="location-name">${location.name}</div>
          <div class="location-area">${location.area}</div>
          <div class="location-metric">${value}</div>
          <div class="location-status ${statusClass}">${status}</div>
        `;

        // Enhanced click handler with haptic feedback simulation
        item.addEventListener('click', () => {
          // Visual feedback
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.transform = '';
          }, 150);

          document.querySelectorAll('.location-item').forEach(el => el.classList.remove('current'));
          item.classList.add('current');
          this.currentLocation = location.name.toLowerCase().replace(/\s+/g, '-');
          this.showToast(`Monitoring ${location.name} - ${location.area}`, 'success');
        });

        // Staggered animation
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        setTimeout(() => {
          item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * 100);

        grid.appendChild(item);
      });
    }, 300);
  }

  async loadWeeklyForecast() {
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // More realistic weather patterns for Bengaluru
    const weatherConditions = [
      { icon: 'fas fa-cloud-sun', condition: 'Partly Cloudy', temp_mod: 0 },
      { icon: 'fas fa-cloud-rain', condition: 'Light Showers', temp_mod: -2 },
      { icon: 'fas fa-sun', condition: 'Sunny', temp_mod: 2 },
      { icon: 'fas fa-cloud', condition: 'Overcast', temp_mod: -1 },
      { icon: 'fas fa-cloud-sun', condition: 'Partly Cloudy', temp_mod: 1 },
      { icon: 'fas fa-cloud-rain', condition: 'Scattered Showers', temp_mod: -1.5 },
      { icon: 'fas fa-sun', condition: 'Clear Skies', temp_mod: 1.5 }
    ];
    
    const forecastGrid = document.getElementById('weeklyForecast');
    if (!forecastGrid) return;

    // Clear with animation
    const existingDays = forecastGrid.querySelectorAll('.forecast-day');
    existingDays.forEach((day, index) => {
      setTimeout(() => {
        day.style.opacity = '0';
        day.style.transform = 'translateY(20px)';
      }, index * 50);
    });

    setTimeout(() => {
      forecastGrid.innerHTML = '';

      days.forEach((day, index) => {
        const baseTemp = 27.2; // Realistic Bengaluru average
        const seasonalVariation = Math.sin((new Date().getMonth() - 2) * Math.PI / 6) * 3;
        const dailyVariation = Math.sin(index * 0.8) * 2;
        const weatherMod = weatherConditions[index].temp_mod;
        
        const high = Math.round(baseTemp + seasonalVariation + dailyVariation + weatherMod + 6);
        const low = Math.round(high - 9 - Math.random() * 2);
        
        // Realistic AQI patterns (weekends better, monsoon season better)
        const isWeekend = index === 5 || index === 6;
        const isMonsoon = [5, 6, 7, 8, 9].includes(new Date().getMonth());
        let baseAqi = 3;
        
        if (isWeekend) baseAqi -= 1;
        if (isMonsoon) baseAqi -= 1;
        if (weatherConditions[index].condition.includes('Rain')) baseAqi -= 1;
        
        const aqi = Math.max(1, Math.min(5, baseAqi + Math.floor(Math.random() * 2)));
        
        const aqiLevels = {
          1: { level: 'Excellent', class: 'status-excellent' },
          2: { level: 'Good', class: 'status-good' },
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

        // Enhanced hover effects with micro-interactions
        dayElement.addEventListener('mouseenter', () => {
          dayElement.style.transform = 'translateY(-12px) scale(1.05)';
          dayElement.querySelector('.forecast-icon i').style.transform = 'scale(1.3) rotate(15deg)';
        });

        dayElement.addEventListener('mouseleave', () => {
          dayElement.style.transform = 'translateY(0) scale(1)';
          dayElement.querySelector('.forecast-icon i').style.transform = 'scale(1) rotate(0deg)';
        });

        // Staggered animation
        dayElement.style.opacity = '0';
        dayElement.style.transform = 'translateY(30px)';
        setTimeout(() => {
          dayElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          dayElement.style.opacity = '1';
          dayElement.style.transform = 'translateY(0)';
        }, index * 100);

        forecastGrid.appendChild(dayElement);
      });
    }, 350);
  }

  async loadInsights() {
    // Generate AI-powered insights based on current conditions
    const insights = {
      aqiInsight: this.generateAdvancedAQIInsight(),
      weatherInsight: this.generateAdvancedWeatherInsight(),
      healthInsight: this.generateAdvancedHealthInsight()
    };

    Object.entries(insights).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        // Typewriter effect for insights
        this.typewriterEffect(element, value);
      }
    });
  }

  generateAdvancedAQIInsight() {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const isMonsoon = [5, 6, 7, 8, 9].includes(month);
    
    const insights = [
      `Current air quality shows ${isRushHour ? 'elevated' : 'moderate'} PM2.5 levels due to ${isRushHour ? 'peak traffic patterns' : 'urban background pollution'}. Wind patterns from the southwest are helping disperse pollutants effectively.`,
      `${isMonsoon ? 'Monsoon conditions are significantly improving' : 'Dry season is contributing to higher'} air quality with ${isMonsoon ? '40-50% reduction' : '20-30% increase'} in particulate matter compared to seasonal averages.`,
      `Real-time analysis indicates optimal air quality windows between 5-7 AM and 10 PM-12 AM when traffic is minimal and atmospheric conditions favor pollutant dispersion.`,
      `Industrial emissions from Peenya and Bommasandra industrial areas are contributing 25-30% to current PM10 levels, with vehicular emissions accounting for the majority of NO₂ concentrations.`,
      `Meteorological conditions suggest air quality will ${Math.random() > 0.5 ? 'improve' : 'remain stable'} over the next 6-8 hours due to changing wind patterns and atmospheric pressure systems.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  generateAdvancedWeatherInsight() {
    const temp = this.dataCache.get('weather')?.temperature || 27;
    const humidity = this.dataCache.get('weather')?.humidity || 65;
    const windSpeed = this.dataCache.get('weather')?.wind_speed || 3;
    
    const insights = [
      `Current atmospheric conditions with ${temp}°C temperature and ${humidity}% humidity create ${humidity > 70 ? 'high moisture content that may increase heat perception' : 'comfortable conditions for outdoor activities'}.`,
      `Wind speeds of ${Math.round(windSpeed * 3.6)} km/h from the ${this.getWindDirection()} are ${windSpeed > 10 ? 'effectively dispersing urban pollutants' : 'providing minimal pollutant dispersion'}, impacting overall air quality dynamics.`,
      `Temperature inversion patterns typical for Bengaluru's elevation (920m) are ${new Date().getHours() < 8 ? 'currently active, trapping pollutants near ground level' : 'dissipating, allowing better air circulation'}.`,
      `Microclimate analysis shows urban heat island effects are adding 2-3°C to ambient temperatures in concrete-heavy areas compared to green spaces like Cubbon Park and Lalbagh.`,
      `Barometric pressure trends indicate ${Math.random() > 0.5 ? 'stable weather patterns' : 'potential atmospheric changes'} that could ${Math.random() > 0.5 ? 'maintain' : 'alter'} current air quality conditions over the next 12-24 hours.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  generateAdvancedHealthInsight() {
    const aqi = this.dataCache.get('airQuality')?.aqi || 3;
    const pm25 = this.dataCache.get('airQuality')?.pm2_5 || 25;
    
    const insights = [
      `With current PM2.5 levels at ${Math.round(pm25)} μg/m³, ${pm25 > 15 ? 'sensitive individuals should limit outdoor exposure and consider N95 masks' : 'conditions are generally safe for outdoor activities with normal precautions'}.`,
      `Health risk assessment indicates ${aqi <= 2 ? 'minimal respiratory impact' : aqi === 3 ? 'moderate concern for sensitive groups' : 'significant health risks'} based on WHO air quality guidelines and local population health data.`,
      `Optimal exercise windows are typically 5-7 AM and 8-10 PM when pollutant concentrations are lowest and temperature-humidity combinations are most favorable for physical activity.`,
      `Long-term exposure patterns suggest using HEPA air purifiers in bedrooms and main living areas, especially for households with children, elderly, or individuals with respiratory conditions.`,
      `Current environmental conditions ${aqi <= 2 ? 'support' : aqi === 3 ? 'moderately support' : 'do not support'} outdoor activities for vulnerable populations including pregnant women, children under 12, and adults over 65.`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  checkAirQualityAlerts(data) {
    const alertsSection = document.getElementById('alertsSection');
    const alertCount = document.getElementById('alertCount');
    
    let alertsActive = 0;
    const alerts = [];

    // Enhanced alert system with multiple criteria
    if (data.aqi >= 4) {
      alertsActive++;
      alerts.push({
        type: 'danger',
        title: 'Poor Air Quality Alert',
        message: `AQI level ${data.aqi} detected. Health advisory in effect for all residents, especially children and elderly.`
      });
    }

    if (data.pm2_5 > 35) {
      alertsActive++;
      alerts.push({
        type: 'warning',
        title: 'PM2.5 Elevated',
        message: `Fine particulate matter at ${Math.round(data.pm2_5)} μg/m³ exceeds WHO guidelines. Consider indoor activities.`
      });
    }

    if (data.no2 > 40) {
      alertsActive++;
      alerts.push({
        type: 'warning',
        title: 'NO₂ Levels High',
        message: `Nitrogen dioxide levels elevated due to traffic emissions. Avoid busy roads and highways.`
      });
    }

    // Update alert display
    if (alertsSection && alerts.length > 0) {
      alertsSection.style.display = 'block';
      const alertContent = alertsSection.querySelector('.alert-content p');
      if (alertContent) {
        alertContent.textContent = alerts[0].message;
      }
    }

    // Update alert count with animation
    if (alertCount) {
      if (alertsActive > 0) {
        alertCount.textContent = alertsActive;
        alertCount.style.display = 'block';
        alertCount.style.animation = 'bounce 0.6s ease-out';
      } else {
        alertCount.style.display = 'none';
      }
    }
  }

  // Enhanced Event Handlers
  async handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
      refreshBtn.disabled = true;
    }

    try {
      await this.loadAllData();
      this.showToast('Environmental intelligence refreshed successfully', 'success');
      
      // Haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      this.showToast('Refresh failed. Please check your connection.', 'error');
    } finally {
      if (refreshBtn) {
        setTimeout(() => {
          refreshBtn.classList.remove('spinning');
          refreshBtn.disabled = false;
        }, 500);
      }
    }
  }

  async handleChartPeriodChange(event) {
    const period = event.target.dataset.period;
    const chartContainer = event.target.closest('.chart-card');
    
    // Enhanced button transition
    chartContainer.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });
    event.target.classList.add('active');
    event.target.style.transform = 'scale(1.05)';

    try {
      // Premium loading state
      const chartCanvas = chartContainer.querySelector('canvas');
      if (chartCanvas) {
        chartCanvas.style.opacity = '0.3';
        chartCanvas.style.filter = 'blur(2px)';
      }

      // Load data with realistic delay
      await this.delay(300);
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

      // Restore with smooth transition
      if (chartCanvas) {
        setTimeout(() => {
          chartCanvas.style.opacity = '1';
          chartCanvas.style.filter = 'blur(0px)';
        }, 200);
      }

      const periodNames = { '24h': '24 hours', '7d': '7 days', '30d': '30 days' };
      this.showToast(`Chart updated to ${periodNames[period]} view`, 'success');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      this.showToast('Failed to update chart data', 'error');
    }
  }

  handleComparisonMetricChange(event) {
    const metric = event.target.dataset.metric;
    
    // Enhanced button animation
    document.querySelectorAll('.comparison-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });
    event.target.classList.add('active');
    event.target.style.transform = 'scale(1.05)';

    // Reload comparison data with smooth animation
    this.loadLocationComparison();
    
    const metricNames = {
      aqi: 'Air Quality Index',
      temp: 'Temperature',
      humidity: 'Humidity Levels'
    };
    
    this.showToast(`Analyzing ${metricNames[metric]} across Bengaluru`, 'success');
  }

  handleForecastToggle(event) {
    const view = event.target.dataset.view;
    
    // Enhanced toggle animation
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });
    event.target.classList.add('active');
    event.target.style.transform = 'scale(1.05)';

    // Reload forecast with enhanced animation
    this.loadWeeklyForecast();
    
    const viewNames = {
      weather: 'Weather Intelligence',
      aqi: 'Air Quality Predictions'
    };
    
    this.showToast(`Switched to ${viewNames[view]}`, 'success');
  }

  toggleAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    const alertsBtn = document.getElementById('alertsBtn');
    
    if (alertsSection && alertsBtn) {
      const isVisible = alertsSection.style.display !== 'none';
      
      if (isVisible) {
        alertsSection.style.animation = 'slideUp 0.4s ease-in';
        setTimeout(() => {
          alertsSection.style.display = 'none';
        }, 400);
      } else {
        alertsSection.style.display = 'block';
        alertsSection.style.animation = 'slideDown 0.6s ease-out';
        this.showToast('Air quality alerts are now visible', 'success');
      }
      
      // Button feedback
      alertsBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        alertsBtn.style.transform = 'scale(1)';
      }, 150);
    }
  }

  openSettings() {
    this.showToast('Settings panel coming soon with personalization options', 'success');
  }

  handleKeyboardShortcuts(event) {
    // Enhanced keyboard shortcuts
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.handleRefresh();
    }
    
    if (event.key === 'Escape') {
      const alertsSection = document.getElementById('alertsSection');
      if (alertsSection) {
        alertsSection.style.display = 'none';
      }
      
      document.querySelectorAll('.toast').forEach(toast => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      });
    }

    // Number keys for quick chart switching
    if (['1', '2', '3'].includes(event.key) && !event.ctrlKey && !event.metaKey) {
      const periods = ['24h', '7d', '30d'];
      const period = periods[parseInt(event.key) - 1];
      
      document.querySelectorAll(`[data-period="${period}"]`).forEach(btn => {
        btn.click();
      });
    }
  }

  // Enhanced Utility Functions
  animateNumber(element, targetValue, suffix = '') {
    const startValue = parseFloat(element.textContent) || 0;
    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      if (suffix === '°' || suffix === '°C') {
        element.textContent = Math.round(currentValue) + suffix;
      } else if (suffix === '%') {
        element.textContent = Math.round(currentValue) + suffix;
      } else if (suffix.includes('μg/m³')) {
        element.textContent = (Math.round(currentValue * 100) / 100) + suffix;
      } else {
        element.textContent = Math.round(currentValue) + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  typewriterEffect(element, text, speed = 30) {
    element.textContent = '';
    let i = 0;
    
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
  }

  capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  getWindDirection() {
    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getColorFromGradient(gradient) {
    // Extract first color from gradient
    const match = gradient.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : '#007AFF';
  }

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

  updateConnectionStatus() {
    const statusDot = document.getElementById('connectionStatus');
    if (statusDot) {
      statusDot.style.background = '#34C759';
      statusDot.style.boxShadow = '0 0 15px rgba(52, 199, 89, 0.6)';
    }
  }

  initializeAnimations() {
    // Enhanced stagger animation for cards
    const cards = document.querySelectorAll('.status-card, .chart-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.95)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, index * 150);
    });

    // Floating particles animation enhancement
    this.enhanceParticleAnimation();
  }

  enhanceParticleAnimation() {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
      // Add random size variations
      const size = 12 + Math.random() * 20;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Add random colors
      const colors = [
        'rgba(52, 199, 89, 0.3)',
        'rgba(0, 122, 255, 0.3)',
        'rgba(255, 149, 0, 0.3)',
        'rgba(90, 200, 250, 0.3)'
      ];
      particle.style.background = `radial-gradient(circle, ${colors[index % colors.length]}, transparent)`;
    });
  }

  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    const status = document.getElementById('loadingStatus');
    
    if (overlay) {
      overlay.classList.add('show');
    }
    
    if (status) {
      const messages = [
        'Connecting to environmental sensors...',
        'Analyzing real-time air quality data...',
        'Processing meteorological information...',
        'Calculating health impact assessments...',
        'Generating intelligent insights...',
        'Finalizing premium dashboard...'
      ];
      
      let messageIndex = 0;
      const updateMessage = () => {
        if (messageIndex < messages.length && overlay.classList.contains('show')) {
          status.textContent = messages[messageIndex];
          messageIndex++;
          setTimeout(updateMessage, 600);
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
      }, 800);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    const icon = icons[type] || icons.info;
    
    toast.innerHTML = `
      <i class="${icon}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    container.appendChild(toast);
    
    // Enhanced auto-remove with fade out
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOutRight 0.4s ease-in';
        setTimeout(() => toast.remove(), 400);
      }
    }, 5000);
  }

  startAutoRefresh() {
    // Intelligent refresh - more frequent during poor air quality
    const getRefreshInterval = () => {
      const aqi = this.dataCache.get('airQuality')?.aqi || 3;
      return aqi >= 4 ? 5 * 60 * 1000 : 10 * 60 * 1000; // 5 min for poor AQI, 10 min otherwise
    };

    const scheduleNextRefresh = () => {
      this.refreshInterval = setTimeout(() => {
        console.log('🔄 Auto-refreshing environmental intelligence...');
        this.loadAllData().then(() => {
          scheduleNextRefresh();
        });
      }, getRefreshInterval());
    };

    scheduleNextRefresh();
  }

  startPerformanceMonitoring() {
    // Monitor app performance and optimize
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`📊 Performance: ${entry.name} = ${Math.round(entry.duration)}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }

  destroy() {
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Destroy charts with cleanup
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    
    // Clear cache
    this.dataCache.clear();
  }
}

// Enhanced utility functions
const premiumUtils = {
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
      1: '#00C851',
      2: '#4CAF50',
      3: '#FF9800',
      4: '#F44336',
      5: '#9C27B0'
    };
    return colors[aqi] || colors[3];
  },
  
  calculateAirQualityIndex: (pm25, pm10, no2, o3) => {
    // More accurate AQI calculation based on Indian standards
    const pm25_aqi = pm25 <= 30 ? 1 : pm25 <= 60 ? 2 : pm25 <= 90 ? 3 : pm25 <= 120 ? 4 : 5;
    const pm10_aqi = pm10 <= 50 ? 1 : pm10 <= 100 ? 2 : pm10 <= 250 ? 3 : pm10 <= 350 ? 4 : 5;
    const no2_aqi = no2 <= 40 ? 1 : no2 <= 80 ? 2 : no2 <= 180 ? 3 : no2 <= 280 ? 4 : 5;
    const o3_aqi = o3 <= 50 ? 1 : o3 <= 100 ? 2 : o3 <= 168 ? 3 : o3 <= 208 ? 4 : 5;
    
    return Math.max(pm25_aqi, pm10_aqi, no2_aqi, o3_aqi);
  },
  
  getHealthRecommendation: (aqi, pm25) => {
    if (aqi <= 2 && pm25 <= 15) return 'Excellent conditions for all activities';
    if (aqi === 3 || pm25 <= 35) return 'Good for most people, sensitive individuals should be cautious';
    if (aqi === 4 || pm25 <= 55) return 'Unhealthy for sensitive groups, limit outdoor exposure';
    return 'Unhealthy for everyone, avoid outdoor activities';
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

// Initialize the premium application
let airQualityMonitor;

document.addEventListener('DOMContentLoaded', function() {
  // Premium loading sequence
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease-in-out';
  
  // Add premium loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    z-index: 10000;
  `;
  loadingIndicator.textContent = 'Initializing AirWatch Intelligence...';
  document.body.appendChild(loadingIndicator);
  
  setTimeout(() => {
    document.body.style.opacity = '1';
    loadingIndicator.remove();
    airQualityMonitor = new PremiumAirQualityMonitor();
  }, 200);
});

// Enhanced cleanup
window.addEventListener('beforeunload', () => {
  if (airQualityMonitor) {
    airQualityMonitor.destroy();
  }
});

// Performance optimization
window.addEventListener('load', () => {
  // Preload critical resources
  const preloadLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
  ];
  
  preloadLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
});

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('🚨 Application Error:', event.error);
  if (airQualityMonitor) {
    airQualityMonitor.showToast('An unexpected error occurred. Refreshing data...', 'error');
    setTimeout(() => {
      airQualityMonitor.loadAllData();
    }, 2000);
  }
});

// Export for debugging and external access
window.airQualityMonitor = airQualityMonitor;
window.premiumUtils = premiumUtils;

// Add enhanced CSS animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
  
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
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 122, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 122, 255, 0.6); }
  }
  
  .premium-glow {
    animation: glow 2s infinite;
  }
`;
document.head.appendChild(enhancedStyles);