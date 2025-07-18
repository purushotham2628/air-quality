class AirQualityApp {
  constructor() {
    this.aqiChart = null;
    this.weatherChart = null;
    this.forecastChart = null;
    this.pollutantChart = null;
    this.historicalData = {
      aqi: [],
      weather: []
    };
    this.locations = {
      'central': { name: 'Central Bengaluru', lat: 12.9716, lon: 77.5946 },
      'whitefield': { name: 'Whitefield', lat: 12.9698, lon: 77.7500 },
      'koramangala': { name: 'Koramangala', lat: 12.9279, lon: 77.6271 },
      'indiranagar': { name: 'Indiranagar', lat: 12.9719, lon: 77.6412 },
      'electronic-city': { name: 'Electronic City', lat: 12.8456, lon: 77.6603 },
      'hebbal': { name: 'Hebbal', lat: 13.0358, lon: 77.5970 },
      'jayanagar': { name: 'Jayanagar', lat: 12.9237, lon: 77.5838 },
      'marathahalli': { name: 'Marathahalli', lat: 12.9591, lon: 77.6974 }
    };
    this.currentLocation = 'central';
    this.currentPeriod = '24h';
    this.currentComparisonMetric = 'aqi';
    this.isLoading = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.alertsShown = false;
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Air Quality App...');
    this.showLoading(true);
    
    try {
      // Wait a bit for DOM to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.loadCurrentData();
      this.initCharts();
      this.setupEventListeners();
      this.loadLocationComparison();
      this.generateWeeklyForecast();
      this.updateStatistics();
      this.startAutoRefresh();
      
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ Initialization error:', error);
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
    if (this.isLoading && this.retryCount === 0) return;
    
    try {
      this.showRefreshAnimation(true);
      console.log('🔄 Loading current data...');
      
      const [airQualityData, weatherData] = await Promise.all([
        this.fetchAirQuality(),
        this.fetchWeather()
      ]);

      console.log('📊 Data loaded successfully:', { 
        airQuality: airQualityData, 
        weather: weatherData 
      });

      this.updateAirQualityDisplay(airQualityData);
      this.updateWeatherDisplay(weatherData);
      this.updateHealthRecommendations(airQualityData.aqi);
      this.updateWeatherSummary(airQualityData, weatherData);
      this.checkForAlerts(airQualityData, weatherData);
      this.updateLastUpdated();
      
      // Store data for historical tracking
      this.storeHistoricalData(airQualityData, weatherData);
      
      // Reset retry count on success
      this.retryCount = 0;
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.loadCurrentData(), 2000 * this.retryCount);
      } else {
        this.showError(`Failed to load data after ${this.maxRetries} attempts. Please check your API key and internet connection.`);
        this.retryCount = 0;
      }
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
    console.log('🌬️ Fetching air quality data...');
    const response = await fetch('/api/air-quality');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Air quality fetch error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch air quality data`);
    }
    
    const data = await response.json();
    console.log('✅ Air quality data received:', data);
    return data;
  }

  async fetchWeather() {
    console.log('🌡️ Fetching weather data...');
    const response = await fetch('/api/weather');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('❌ Weather fetch error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch weather data`);
    }
    
    const data = await response.json();
    console.log('✅ Weather data received:', data);
    return data;
  }

  updateWeatherSummary(airQualityData, weatherData) {
    console.log('📋 Updating weather summary...');
    
    // Update summary values
    this.updateElement('summaryAqi', this.getAQILevel(airQualityData.aqi));
    this.updateElement('summaryTemp', `${Math.round(weatherData.temperature)}°C`);
    this.updateElement('summaryHumidity', `${weatherData.humidity}%`);
    
    // Calculate and display UV Index (mock calculation based on time and weather)
    const uvIndex = this.calculateUVIndex(weatherData);
    this.updateElement('summaryUV', this.getUVLevel(uvIndex));
    this.updateElement('uvIndex', uvIndex);
    
    // Calculate dew point
    const dewPoint = this.calculateDewPoint(weatherData.temperature, weatherData.humidity);
    this.updateElement('dewPoint', `${Math.round(dewPoint)}°C`);
    
    // Update weather trend
    const trend = this.calculateWeatherTrend(airQualityData.aqi);
    const trendElement = document.getElementById('weatherTrend');
    if (trendElement) {
      const icon = trendElement.querySelector('.trend-icon');
      const text = trendElement.querySelector('span');
      
      if (trend.improving) {
        icon.className = 'fas fa-arrow-up trend-icon';
        icon.style.color = '#48bb78';
        text.textContent = 'Improving';
      } else if (trend.worsening) {
        icon.className = 'fas fa-arrow-down trend-icon';
        icon.style.color = '#f56565';
        text.textContent = 'Worsening';
      } else {
        icon.className = 'fas fa-minus trend-icon';
        icon.style.color = '#ed8936';
        text.textContent = 'Stable';
      }
    }
  }

  calculateUVIndex(weatherData) {
    // Mock UV calculation based on time of day and cloud cover
    const hour = new Date().getHours();
    let baseUV = 0;
    
    if (hour >= 6 && hour <= 18) {
      // Daytime UV calculation
      const peakHours = Math.abs(hour - 12);
      baseUV = Math.max(0, 10 - peakHours * 1.2);
      
      // Adjust for cloud cover (if available)
      if (weatherData.clouds) {
        baseUV *= (1 - weatherData.clouds / 150);
      }
    }
    
    return Math.max(0, Math.round(baseUV));
  }

  getUVLevel(uvIndex) {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  calculateDewPoint(temp, humidity) {
    // Magnus formula for dew point calculation
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  calculateWeatherTrend(currentAqi) {
    // Simple trend calculation based on recent data
    const recentData = this.historicalData.aqi.slice(-3);
    if (recentData.length < 2) {
      return { improving: false, worsening: false };
    }
    
    const avgRecent = recentData.reduce((sum, d) => sum + d.aqi, 0) / recentData.length;
    
    return {
      improving: currentAqi < avgRecent - 0.5,
      worsening: currentAqi > avgRecent + 0.5
    };
  }

  updateAirQualityDisplay(data) {
    console.log('🎨 Updating AQI display with:', data);
    
    const { aqi, pm2_5, pm10, no2, o3 } = data;
    
    // Update AQI badge with animation
    this.animateValue('aqiValue', aqi, 0);
    this.updateElement('aqiLevel', this.getAQILevel(aqi));
    
    const badge = document.getElementById('aqiBadge');
    if (badge) {
      badge.className = `aqi-badge ${this.getAQIClass(aqi)}`;
    }
    
    // Update pollutant values and bars with animation
    this.updatePollutant('pm25', pm2_5, 25);
    this.updatePollutant('pm10', pm10, 50);
    this.updatePollutant('no2', no2 || 0, 40);
    this.updatePollutant('o3', o3 || 0, 100);
    
    // Update comparison values (mock data for yesterday and last week)
    this.updateElement('aqiYesterday', Math.max(1, aqi + Math.round((Math.random() - 0.5) * 2)));
    this.updateElement('aqiLastWeek', Math.max(1, aqi + Math.round((Math.random() - 0.5) * 3)));
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
      console.log(`✅ Updated ${id} to: ${value}`);
    } else {
      console.warn(`⚠️ Element ${id} not found`);
    }
  }

  animateValue(elementId, targetValue, startValue = 0, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for animation`);
      return;
    }

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
      console.log(`✅ Updated ${id} value: ${value} μg/m³`);
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
    console.log('🌤️ Updating weather display with:', data);
    
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

    // Validate critical data
    if (temperature === undefined || temperature === null) {
      console.error('❌ Temperature data is missing');
      this.showError('Weather data is incomplete. Retrying...');
      return;
    }

    // Animate temperature
    this.animateTemperature(temperature);
    
    // Update all weather elements
    const weatherUpdates = {
      'feelsLike': `${Math.round(feels_like || temperature)}°C`,
      'weatherDescription': this.capitalizeWords(description || 'Unknown'),
      'humidity': `${humidity || 0}%`,
      'windSpeed': `${Math.round((wind_speed || 0) * 3.6)} km/h`,
      'visibility': `${visibility || 10} km`,
      'pressure': `${pressure || 1013} hPa`
    };

    console.log('🔄 Applying weather updates:', weatherUpdates);

    Object.entries(weatherUpdates).forEach(([id, value]) => {
      this.updateElement(id, value);
    });
    
    // Update weather icon with animation
    this.updateWeatherIcon(icon);
  }

  animateTemperature(targetTemp) {
    const tempElement = document.getElementById('temperature');
    if (!tempElement) {
      console.error('❌ Temperature element not found');
      return;
    }

    console.log(`🌡️ Animating temperature to ${targetTemp}°C`);

    const currentTempText = tempElement.textContent.replace('°C', '').replace('--', '0');
    const currentTemp = parseFloat(currentTempText) || 0;
    const startTime = performance.now();
    const duration = 1500;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = currentTemp + (targetTemp - currentTemp) * this.easeOutCubic(progress);
      tempElement.textContent = `${Math.round(currentValue)}°C`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log(`✅ Temperature animation complete: ${Math.round(targetTemp)}°C`);
      }
    };
    
    requestAnimationFrame(animate);
  }

  updateWeatherIcon(iconCode) {
    const iconElement = document.getElementById('weatherIcon');
    if (!iconElement) {
      console.warn('⚠️ Weather icon element not found');
      return;
    }

    iconElement.style.transform = 'scale(0)';
    setTimeout(() => {
      const iconClass = this.getWeatherIcon(iconCode);
      iconElement.className = iconClass;
      iconElement.style.transform = 'scale(1)';
      console.log(`✅ Weather icon updated: ${iconCode} -> ${iconClass}`);
    }, 200);
  }

  capitalizeWords(str) {
    if (!str) return 'Unknown';
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

  checkForAlerts(airQualityData, weatherData) {
    const alerts = [];
    
    // Air quality alerts
    if (airQualityData.aqi >= 4) {
      alerts.push({
        type: 'air-quality',
        icon: 'fas fa-exclamation-triangle',
        title: 'Poor Air Quality Alert',
        description: 'Air quality is unhealthy. Limit outdoor activities and wear masks when outside.'
      });
    }
    
    // High PM2.5 alert
    if (airQualityData.pm2_5 > 35) {
      alerts.push({
        type: 'pm25',
        icon: 'fas fa-smog',
        title: 'High PM2.5 Levels',
        description: `PM2.5 levels are at ${airQualityData.pm2_5} μg/m³, which exceeds safe limits.`
      });
    }
    
    // Temperature alerts
    if (weatherData.temperature > 35) {
      alerts.push({
        type: 'heat',
        icon: 'fas fa-thermometer-full',
        title: 'Heat Advisory',
        description: 'High temperatures detected. Stay hydrated and avoid prolonged sun exposure.'
      });
    }
    
    // UV alerts
    const uvIndex = this.calculateUVIndex(weatherData);
    if (uvIndex > 7) {
      alerts.push({
        type: 'uv',
        icon: 'fas fa-sun',
        title: 'High UV Index',
        description: 'UV levels are high. Use sunscreen and protective clothing when outdoors.'
      });
    }
    
    this.displayAlerts(alerts);
  }

  displayAlerts(alerts) {
    const alertsSection = document.getElementById('alertsSection');
    const alertContent = document.getElementById('alertContent');
    
    if (alerts.length > 0 && !this.alertsShown) {
      alertsSection.style.display = 'grid';
      alertContent.innerHTML = alerts.map(alert => `
        <div class="alert-item">
          <i class="alert-icon ${alert.icon}"></i>
          <div class="alert-text">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-description">${alert.description}</div>
          </div>
        </div>
      `).join('');
      this.alertsShown = true;
    } else if (alerts.length === 0) {
      alertsSection.style.display = 'none';
      this.alertsShown = false;
    }
  }

  async loadLocationComparison() {
    console.log('🗺️ Loading location comparison data...');
    
    const comparisonData = {};
    
    // Generate mock data for different locations
    Object.keys(this.locations).forEach(locationKey => {
      const location = this.locations[locationKey];
      const baseAqi = 2 + Math.random() * 2;
      const baseTemp = 25 + (Math.random() - 0.5) * 8;
      const baseHumidity = 65 + (Math.random() - 0.5) * 20;
      
      comparisonData[locationKey] = {
        name: location.name,
        aqi: Math.max(1, Math.min(5, Math.round(baseAqi))),
        temperature: Math.round(baseTemp),
        humidity: Math.max(20, Math.min(95, Math.round(baseHumidity)))
      };
    });
    
    this.updateLocationComparison(comparisonData);
  }

  updateLocationComparison(data) {
    const grid = document.getElementById('comparisonGrid');
    if (!grid) return;
    
    const metric = this.currentComparisonMetric;
    
    grid.innerHTML = Object.keys(data).map(locationKey => {
      const location = data[locationKey];
      const isCurrent = locationKey === this.currentLocation;
      
      let value, unit, statusClass, statusText;
      
      switch (metric) {
        case 'aqi':
          value = location.aqi;
          unit = '';
          statusClass = this.getAQIClass(location.aqi);
          statusText = this.getAQILevel(location.aqi);
          break;
        case 'temp':
          value = location.temperature;
          unit = '°C';
          statusClass = location.temperature > 30 ? 'aqi-poor' : location.temperature > 25 ? 'aqi-moderate' : 'aqi-good';
          statusText = location.temperature > 30 ? 'Hot' : location.temperature > 25 ? 'Warm' : 'Pleasant';
          break;
        case 'humidity':
          value = location.humidity;
          unit = '%';
          statusClass = location.humidity > 70 ? 'aqi-poor' : location.humidity > 50 ? 'aqi-moderate' : 'aqi-good';
          statusText = location.humidity > 70 ? 'High' : location.humidity > 50 ? 'Moderate' : 'Low';
          break;
      }
      
      return `
        <div class="location-item ${isCurrent ? 'current' : ''}" data-location="${locationKey}">
          <div class="location-name">${location.name}</div>
          <div class="location-metric">${value}${unit}</div>
          <div class="location-status ${statusClass}">${statusText}</div>
        </div>
      `;
    }).join('');
  }

  generateWeeklyForecast() {
    console.log('📅 Generating weekly forecast...');
    
    const forecastGrid = document.getElementById('weeklyForecast');
    if (!forecastGrid) return;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[date.getDay()];
      const high = Math.round(26 + Math.sin(i * 0.5) * 4 + Math.random() * 3);
      const low = Math.round(high - 8 - Math.random() * 3);
      const aqi = Math.max(1, Math.min(5, Math.round(2.5 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.5)));
      
      // Weather icons based on patterns
      const icons = ['fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain'];
      const icon = icons[Math.floor(Math.random() * icons.length)];
      
      forecast.push({
        day: dayName,
        date: date.getDate(),
        icon,
        high,
        low,
        aqi,
        aqiLevel: this.getAQILevel(aqi),
        aqiClass: this.getAQIClass(aqi)
      });
    }
    
    forecastGrid.innerHTML = forecast.map(day => `
      <div class="forecast-day">
        <div class="forecast-date">${day.day}</div>
        <i class="forecast-icon ${day.icon}"></i>
        <div class="forecast-temps">
          <span class="forecast-high">${day.high}°</span>
          <span class="forecast-low">${day.low}°</span>
        </div>
        <div class="forecast-aqi ${day.aqiClass}">${day.aqiLevel}</div>
      </div>
    `).join('');
  }

  updateStatistics() {
    console.log('📊 Updating statistics...');
    
    const statsFooter = document.getElementById('statsFooter');
    if (!statsFooter) return;
    
    // Generate mock statistics
    const stats = [
      {
        number: '2.8M',
        label: 'People Monitored',
        description: 'Daily active users'
      },
      {
        number: '24/7',
        label: 'Real-time Updates',
        description: 'Continuous monitoring'
      },
      {
        number: '8',
        label: 'Locations Tracked',
        description: 'Across Bengaluru'
      },
      {
        number: '99.9%',
        label: 'Uptime',
        description: 'Service reliability'
      }
    ];
    
    statsFooter.innerHTML = stats.map(stat => `
      <div class="stat-item">
        <span class="stat-number">${stat.number}</span>
        <div class="stat-label">${stat.label}</div>
        <div class="stat-description">${stat.description}</div>
      </div>
    `).join('');
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
    this.updateElement('lastUpdated', `Updated at ${timeString}`);
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
    console.log('📊 Initializing charts...');
    
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
      console.log('✅ AQI chart initialized');
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
      console.log('✅ Weather chart initialized');
    }

    // Initialize Forecast Chart
    const forecastCtx = document.getElementById('forecastChart');
    if (forecastCtx) {
      this.forecastChart = new Chart(forecastCtx.getContext('2d'), {
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
            pointBackgroundColor: '#ed8936',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
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
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#ed8936',
              borderWidth: 1,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: { size: 11 },
                color: '#6b7280'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
              },
              ticks: {
                font: { size: 11 },
                color: '#6b7280',
                maxTicksLimit: 12
              }
            }
          }
        }
      });
      console.log('✅ Forecast chart initialized');
    }

    // Initialize Pollutant Chart
    const pollutantCtx = document.getElementById('pollutantChart');
    if (pollutantCtx) {
      this.pollutantChart = new Chart(pollutantCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['PM2.5', 'PM10', 'NO₂', 'O₃', 'CO', 'SO₂'],
          datasets: [{
            data: [25, 35, 15, 20, 3, 2],
            backgroundColor: [
              '#f56565',
              '#ed8936',
              '#ecc94b',
              '#48bb78',
              '#38b2ac',
              '#667eea'
            ],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
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
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            }
          }
        }
      });
      console.log('✅ Pollutant chart initialized');
    }

    // Generate some sample historical data for demonstration
    this.generateSampleData();
    this.generateForecastData();
  }

  generateSampleData() {
    console.log('📈 Generating sample historical data...');
    
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
    console.log('✅ Sample data generated and charts updated');
  }

  generateForecastData() {
    console.log('🔮 Generating forecast data...');
    
    if (!this.forecastChart) return;
    
    const labels = [];
    const tempData = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      
      // Generate realistic temperature forecast
      const hour = time.getHours();
      const baseTemp = 25 + Math.sin((hour - 6) * Math.PI / 12) * 6;
      tempData.push(Math.round((baseTemp + Math.random() * 2) * 10) / 10);
    }
    
    this.forecastChart.data.labels = labels;
    this.forecastChart.data.datasets[0].data = tempData;
    this.forecastChart.update('none');
  }

  updateCharts() {
    if (!this.aqiChart || !this.weatherChart) {
      console.warn('⚠️ Charts not initialized yet');
      return;
    }

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

    // Update forecast chart if needed
    if (this.forecastChart) {
      // Forecast chart uses static hourly data, so no need to update based on period
    }

    console.log(`📊 Charts updated for period: ${period}`);
  }

  setupEventListeners() {
    console.log('🎛️ Setting up event listeners...');
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('🔄 Manual refresh triggered');
        this.retryCount = 0; // Reset retry count for manual refresh
        this.loadCurrentData();
      });
    }

    // Location selector
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
      locationSelect.addEventListener('change', (e) => {
        const newLocation = e.target.value;
        if (newLocation !== this.currentLocation) {
          console.log(`📍 Switching to location: ${newLocation}`);
          this.currentLocation = newLocation;
          
          // Update current location display
          const currentLocationElement = document.getElementById('currentLocation');
          if (currentLocationElement) {
            currentLocationElement.textContent = this.locations[newLocation].name;
          }
          
          // Reload data for new location
          this.retryCount = 0;
          this.loadCurrentData();
          this.loadLocationComparison();
        }
      });
    }

    // Comparison metric buttons
    document.querySelectorAll('.comparison-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metric = e.target.dataset.metric;
        if (metric && metric !== this.currentComparisonMetric) {
          console.log(`📊 Switching comparison metric to: ${metric}`);
          this.currentComparisonMetric = metric;
          
          // Update active button
          e.target.parentElement.querySelectorAll('.comparison-btn').forEach(b => 
            b.classList.remove('active')
          );
          e.target.classList.add('active');
          
          this.loadLocationComparison();
        }
      });
    });

    // Location item clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.location-item')) {
        const locationItem = e.target.closest('.location-item');
        const location = locationItem.dataset.location;
        if (location && location !== this.currentLocation) {
          console.log(`📍 Clicked location: ${location}`);
          
          // Update location selector
          if (locationSelect) {
            locationSelect.value = location;
            locationSelect.dispatchEvent(new Event('change'));
          }
        }
      }
    });

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareWeatherData();
      });
    }

    // Dismiss alerts
    const dismissAlerts = document.getElementById('dismissAlerts');
    if (dismissAlerts) {
      dismissAlerts.addEventListener('click', () => {
        const alertsSection = document.getElementById('alertsSection');
        if (alertsSection) {
          alertsSection.style.display = 'none';
          this.alertsShown = false;
        }
      });
    }

    // Forecast toggle buttons
    document.querySelectorAll('[data-forecast]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const forecastType = e.target.dataset.forecast;
        console.log(`🔮 Switching forecast to: ${forecastType}`);
        
        // Update active button
        e.target.parentElement.querySelectorAll('.chart-btn').forEach(b => 
          b.classList.remove('active')
        );
        e.target.classList.add('active');
        
        this.updateForecastChart(forecastType);
      });
    });

    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const period = e.target.dataset.period;
        if (period && period !== this.currentPeriod) {
          console.log(`📊 Switching chart period to: ${period}`);
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
        console.log('⌨️ Keyboard refresh triggered');
        this.retryCount = 0;
        this.loadCurrentData();
      }
    });

    console.log('✅ Event listeners set up');
  }

  updateForecastChart(type) {
    if (!this.forecastChart) return;
    
    if (type === 'aqi') {
      // Switch to AQI forecast
      this.forecastChart.data.datasets[0].label = 'AQI Forecast';
      this.forecastChart.data.datasets[0].borderColor = '#667eea';
      this.forecastChart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.1)';
      this.forecastChart.data.datasets[0].pointBackgroundColor = '#667eea';
      
      // Generate AQI forecast data
      const aqiData = [];
      for (let i = 0; i < 24; i++) {
        const baseAqi = 2.5 + Math.sin(i * 0.2) * 1.2 + Math.random() * 0.5;
        aqiData.push(Math.max(1, Math.min(5, Math.round(baseAqi * 10) / 10)));
      }
      this.forecastChart.data.datasets[0].data = aqiData;
    } else {
      // Switch back to temperature
      this.forecastChart.data.datasets[0].label = 'Temperature (°C)';
      this.forecastChart.data.datasets[0].borderColor = '#ed8936';
      this.forecastChart.data.datasets[0].backgroundColor = 'rgba(237, 137, 54, 0.1)';
      this.forecastChart.data.datasets[0].pointBackgroundColor = '#ed8936';
      
      this.generateForecastData();
      return; // generateForecastData already updates the chart
    }
    
    this.forecastChart.update('none');
  }

  shareWeatherData() {
    console.log('📤 Sharing weather data...');
    
    const currentLocation = this.locations[this.currentLocation].name;
    const temp = document.getElementById('temperature')?.textContent || '--°C';
    const aqi = document.getElementById('aqiValue')?.textContent || '--';
    const aqiLevel = document.getElementById('aqiLevel')?.textContent || 'Unknown';
    
    const shareText = `🌡️ Current weather in ${currentLocation}:
Temperature: ${temp}
Air Quality: ${aqi} (${aqiLevel})

Check live updates at: ${window.location.href}

#BengaluruWeather #AirQuality #WeatherUpdate`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Bengaluru Weather Update',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast('Weather data copied to clipboard!', 'success');
      }).catch(() => {
        this.showToast('Unable to copy to clipboard', 'error');
      });
    }
  }

  showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    
    // Add toast styles
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 1001;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }

  startAutoRefresh() {
    console.log('⏰ Starting auto-refresh (10 minutes interval)');
    
    // Refresh data every 10 minutes
    setInterval(() => {
      if (!this.isLoading) {
        console.log('🔄 Auto-refresh triggered');
        this.loadCurrentData();
      }
    }, 10 * 60 * 1000);
  }

  showError(message) {
    console.error('🚨 Showing error:', message);
    
    // Remove existing toasts
    document.querySelectorAll('.error-toast').forEach(toast => toast.remove());
    
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
    
    // Auto remove after 8 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 8000);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM loaded, initializing Air Quality App...');
  new AirQualityApp();
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
  console.error('💥 Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason);
});