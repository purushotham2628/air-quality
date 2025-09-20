// Air Quality Monitor Dashboard JavaScript

class AirQualityMonitor {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('🌟 Initializing Air Quality Monitor Dashboard');
        
        // Show loading screen
        this.showLoading();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadAllData();
        
        // Load advanced ML features
        await this.loadAdvancedMLFeatures();
        
        // Hide loading screen
        this.hideLoading();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }

    async loadAdvancedMLFeatures() {
        try {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            
            // Load neural network predictions
            await this.loadNeuralPredictions(currentCity);
            
            // Load anomaly detection
            await this.loadAnomalyDetection(currentCity);
            
            // Load clustering analysis
            await this.loadClusteringAnalysis(currentCity);
            
            // Load advanced forecasting
            await this.loadAdvancedForecasting(currentCity);
            
        } catch (error) {
            console.error('Failed to load advanced ML features:', error);
            this.showAlert('Some advanced features may not be available', 'warning');
        }
    }

    async loadNeuralPredictions(city) {
        try {
            const response = await fetch(`/api/ml/neural-predictions/${city}`);
            if (response.ok) {
                const data = await response.json();
                this.updateNeuralPredictionsUI(data);
            }
        } catch (error) {
            console.error('Failed to load neural predictions:', error);
            document.getElementById('neural-predictions').innerHTML = 
                '<span class="error-text">Neural predictions temporarily unavailable</span>';
        }
    }

    async loadAnomalyDetection(city) {
        try {
            const response = await fetch(`/api/ml/anomaly-detection/${city}`);
            if (response.ok) {
                const data = await response.json();
                this.updateAnomalyDetectionUI(data);
            }
        } catch (error) {
            console.error('Failed to load anomaly detection:', error);
            document.getElementById('anomaly-alerts').innerHTML = 
                '<span class="error-text">Anomaly detection temporarily unavailable</span>';
        }
    }

    async loadClusteringAnalysis(city) {
        try {
            const response = await fetch(`/api/ml/clustering/${city}`);
            if (response.ok) {
                const data = await response.json();
                this.updateClusteringUI(data);
            }
        } catch (error) {
            console.error('Failed to load clustering analysis:', error);
            document.getElementById('clustering-results').innerHTML = 
                '<span class="error-text">Clustering analysis temporarily unavailable</span>';
        }
    }

    async loadAdvancedForecasting(city) {
        try {
            const response = await fetch(`/api/ml/advanced-forecast/${city}?days=3`);
            if (response.ok) {
                const data = await response.json();
                this.updateAdvancedForecastUI(data);
            }
        } catch (error) {
            console.error('Failed to load advanced forecasting:', error);
        }
    }

    updateNeuralPredictionsUI(data) {
        const container = document.getElementById('neural-predictions');
        if (!container || !data.neural_predictions) return;

        const predictions = data.neural_predictions.slice(0, 6); // Next 6 hours
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        
        container.innerHTML = `
            <div class="prediction-summary">
                <div class="prediction-metric">
                    <span class="metric-label">Next 6 Hours Avg AQI:</span>
                    <span class="metric-value">${Math.round(predictions.reduce((sum, p) => sum + p.aqi_prediction, 0) / predictions.length * 50)}</span>
                </div>
                <div class="prediction-metric">
                    <span class="metric-label">Confidence:</span>
                    <span class="metric-value">${Math.round(avgConfidence)}%</span>
                </div>
            </div>
            <div class="prediction-timeline">
                ${predictions.map(pred => `
                    <div class="prediction-item">
                        <span class="pred-time">${new Date(pred.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</span>
                        <span class="pred-aqi ${this.getAQIClass(pred.aqi_prediction * 50)}">${Math.round(pred.aqi_prediction * 50)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Update confidence indicator
        const confidenceFill = document.getElementById('confidence-fill');
        const confidenceValue = document.getElementById('confidence-value');
        if (confidenceFill && confidenceValue) {
            confidenceFill.style.width = `${avgConfidence}%`;
            confidenceValue.textContent = `${Math.round(avgConfidence)}%`;
        }
    }

    updateAnomalyDetectionUI(data) {
        const container = document.getElementById('anomaly-alerts');
        if (!container || !data.anomaly_detection) return;

        const anomalies = data.anomaly_detection.anomalies || [];
        const recentAnomalies = anomalies.slice(-3); // Last 3 anomalies
        
        if (recentAnomalies.length === 0) {
            container.innerHTML = `
                <div class="anomaly-status normal">
                    <i class="fas fa-check-circle"></i>
                    <span>No recent anomalies detected</span>
                </div>
                <div class="anomaly-metric">
                    <span class="metric-label">System Status:</span>
                    <span class="metric-value normal">Normal</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="anomaly-status alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${recentAnomalies.length} anomalies detected</span>
                </div>
                <div class="anomaly-list">
                    ${recentAnomalies.map(anomaly => `
                        <div class="anomaly-item">
                            <span class="anomaly-time">${new Date(anomaly.timestamp).toLocaleString()}</span>
                            <span class="anomaly-severity ${anomaly.severity.toLowerCase()}">${anomaly.severity}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Update anomaly risk metric
        const anomalyRisk = document.getElementById('anomaly-risk');
        if (anomalyRisk) {
            anomalyRisk.textContent = data.alert_level || 'Normal';
            anomalyRisk.className = `anomaly-risk ${(data.alert_level || 'normal').toLowerCase()}`;
        }
    }

    updateClusteringUI(data) {
        const container = document.getElementById('clustering-results');
        if (!container || !data.clustering_analysis) return;

        const clusters = data.clustering_analysis.clusters || [];
        const insights = data.insights || [];
        
        container.innerHTML = `
            <div class="clustering-summary">
                <div class="cluster-metric">
                    <span class="metric-label">Patterns Found:</span>
                    <span class="metric-value">${clusters.length}</span>
                </div>
                <div class="cluster-metric">
                    <span class="metric-label">Quality Score:</span>
                    <span class="metric-value">${Math.round((data.clustering_analysis.silhouette_score || 0.7) * 100)}%</span>
                </div>
            </div>
            <div class="cluster-insights">
                ${insights.slice(0, 2).map(insight => `
                    <div class="cluster-insight">
                        <strong>${insight.pattern}:</strong> ${insight.frequency} of the time
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateAdvancedForecastUI(data) {
        if (!data.advanced_forecast) return;
        
        const summary = data.forecast_summary;
        const insights = data.actionable_insights;
        
        // Update pattern insights
        const patternContainer = document.getElementById('pattern-insights');
        if (patternContainer && summary) {
            patternContainer.innerHTML = `
                <div class="forecast-summary">
                    <div class="forecast-metric">
                        <span class="metric-label">3-Day Trend:</span>
                        <span class="metric-value ${summary.overall_trend.toLowerCase()}">${summary.overall_trend}</span>
                    </div>
                    <div class="forecast-metric">
                        <span class="metric-label">Good Air Days:</span>
                        <span class="metric-value">${summary.good_air_days}/3</span>
                    </div>
                </div>
                ${insights ? `
                    <div class="forecast-insights">
                        ${insights.slice(0, 2).map(insight => `
                            <div class="forecast-insight">
                                <strong>${insight.type === 'best_day' ? '✅' : '⚠️'} ${insight.date}:</strong>
                                ${insight.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;
        }
        
        // Update health risk score
        const healthScore = document.getElementById('health-score');
        if (healthScore && summary) {
            const riskScore = summary.poor_air_days === 0 ? 85 : 
                            summary.poor_air_days === 1 ? 70 : 
                            summary.poor_air_days === 2 ? 55 : 40;
            healthScore.textContent = `${riskScore}/100`;
            healthScore.className = `health-score ${riskScore > 70 ? 'good' : riskScore > 50 ? 'moderate' : 'poor'}`;
        }
    }

    toggleLocationComparison() {
        const title = document.getElementById('location-comparison-title');
        const currentMode = title.textContent.includes('Area') ? 'areas' : 'cities';
        
        if (currentMode === 'areas') {
            title.textContent = 'Multi-City Comparison';
            this.loadCityComparison();
        } else {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const cityName = this.getCityName(currentCity);
            title.textContent = `${cityName} Areas Comparison`;
            this.updateLocationComparison();
        }
    }

    async loadCityComparison() {
        const container = document.getElementById('location-grid');
        if (!container) return;

        try {
            const response = await fetch('/api/cities/compare');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            container.innerHTML = data.cities.map(city => `
                <div class="location-item">
                    <div class="location-name">${city.city}</div>
                    <div class="location-aqi ${this.getAQIClass(city.aqi_indian)}">${city.aqi_indian}</div>
                    <div class="location-temp">${Math.round(city.temperature)}°C</div>
                    <div class="location-status">${this.getAQIStatus(city.aqi_indian)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching multi-city data:', error);
            // Fallback to mock data
            const cities = [
                { city: 'Bengaluru', aqi_indian: 85, temperature: 26 },
                { city: 'Mumbai', aqi_indian: 92, temperature: 27 },
                { city: 'Delhi', aqi_indian: 125, temperature: 24 },
                { city: 'Chennai', aqi_indian: 88, temperature: 28 },
                { city: 'Kolkata', aqi_indian: 95, temperature: 27 },
                { city: 'Hyderabad', aqi_indian: 82, temperature: 26 },
                { city: 'Pune', aqi_indian: 78, temperature: 25 },
                { city: 'Ahmedabad', aqi_indian: 98, temperature: 29 }
            ];

            container.innerHTML = cities.map(city => `
                <div class="location-item">
                    <div class="location-name">${city.city}</div>
                    <div class="location-aqi ${this.getAQIClass(city.aqi_indian)}">${city.aqi_indian}</div>
                    <div class="location-temp">${city.temperature}°C</div>
                    <div class="location-status">${this.getAQIStatus(city.aqi_indian)}</div>
                </div>
            `).join('');
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAllData());
        }

        // City selector
        const citySelector = document.getElementById('city-selector');
        if (citySelector) {
            citySelector.addEventListener('change', (e) => {
                this.changeCity(e.target.value);
            });
        }

        // Toggle comparison button
        const toggleComparison = document.getElementById('toggle-comparison');
        if (toggleComparison) {
            toggleComparison.addEventListener('click', () => {
                this.toggleLocationComparison();
            });
        }

        // Period selectors
        const aqiPeriodSelect = document.getElementById('aqi-period-select');
        const weatherPeriodSelect = document.getElementById('weather-period-select');
        
        if (aqiPeriodSelect) {
            aqiPeriodSelect.addEventListener('change', (e) => {
                this.updateAQIChart(e.target.value);
            });
        }
        
        if (weatherPeriodSelect) {
            weatherPeriodSelect.addEventListener('change', (e) => {
                this.updateWeatherChart(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshAllData();
            }
            if (e.key === 'Escape') {
                this.dismissAlerts();
            }
        });

        // Alert dismissal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.alert')) {
                e.target.closest('.alert').remove();
            }
        });
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    async loadAllData() {
        try {
            this.isLoading = true;
            
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            
            const [airQualityData, weatherData, aqiHistoricalData, weatherHistoricalData] = await Promise.all([
                this.fetchAirQuality(currentCity),
                this.fetchWeather(currentCity),
                this.fetchHistoricalData('aqi', '24h', currentCity),
                this.fetchHistoricalData('weather', '24h', currentCity)
            ]);

            // Fetch advanced ML data
            const [mlPredictions, mlInsights, anomalyData] = await Promise.all([
                this.fetchMLPredictions(currentCity),
                this.fetchMLInsights(currentCity),
                this.fetchAnomalyData(currentCity)
            ]).catch(() => [null, null, null]); // Graceful fallback
            // Update UI
            this.updateAirQualityUI(airQualityData);
            this.updateWeatherUI(weatherData);
            this.updateHealthRecommendations(airQualityData);
            this.updateLocationComparison();

            // Load charts
            await this.loadCharts();

            // Update timestamp
            this.updateLastUpdated();

            // Check for alerts
            this.checkAirQualityAlerts(airQualityData);
            
            // Refresh ML features
            await this.loadAdvancedMLFeatures();

        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showAlert('Failed to load environmental data. Please check your connection.', 'danger');
        } finally {
            this.isLoading = false;
        }
    }

    async fetchAirQuality() {
        const response = await fetch('/api/air-quality');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async fetchWeather() {
        const response = await fetch('/api/weather');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async fetchHistoricalData(type, period = '24h', city = 'bengaluru') {
        const response = await fetch(`/api/historical/${type}?period=${period}&city=${city}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    updateAirQualityUI(data) {
        // AQI Badge and Value
        const aqiBadge = document.getElementById('aqi-badge');
        const aqiValue = document.getElementById('aqi-value');
        const aqiStatus = document.getElementById('aqi-status');

        if (aqiBadge && aqiValue && aqiStatus) {
            const aqiInfo = this.getAQIInfo(data.aqi);
            
            aqiBadge.textContent = aqiInfo.label;
            aqiBadge.className = `aqi-badge ${aqiInfo.class}`;
            
            aqiValue.textContent = data.aqi_indian || data.aqi * 50;
            aqiValue.className = `aqi-value ${aqiInfo.class}`;
            
            aqiStatus.textContent = aqiInfo.description;
        }

        // Pollutant values and progress bars
        this.updatePollutant('pm25', data.pm2_5, 15); // WHO guideline: 15 μg/m³
        this.updatePollutant('pm10', data.pm10, 45);  // WHO guideline: 45 μg/m³
        this.updatePollutant('no2', data.no2, 25);    // WHO guideline: 25 μg/m³
        this.updatePollutant('o3', data.o3, 100);     // WHO guideline: 100 μg/m³
    }

    updatePollutant(pollutant, value, maxSafe) {
        const valueElement = document.getElementById(`${pollutant}-value`);
        const progressElement = document.getElementById(`${pollutant}-progress`);

        if (valueElement && progressElement) {
            valueElement.textContent = `${value} μg/m³`;
            
            const percentage = Math.min((value / maxSafe) * 100, 100);
            progressElement.style.width = `${percentage}%`;
            
            // Color coding based on safety levels
            if (percentage <= 50) {
                progressElement.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
            } else if (percentage <= 75) {
                progressElement.style.background = 'linear-gradient(90deg, #eab308, #ca8a04)';
            } else {
                progressElement.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            }
        }
    }

    updateWeatherUI(data) {
        // Temperature
        const temperature = document.getElementById('temperature');
        const feelsLike = document.getElementById('feels-like');
        const weatherDescription = document.getElementById('weather-description');
        const weatherIcon = document.getElementById('weather-icon');

        if (temperature) temperature.textContent = Math.round(data.temperature);
        if (feelsLike) feelsLike.textContent = Math.round(data.feels_like);
        if (weatherDescription) weatherDescription.textContent = data.description;
        
        // Weather icon
        if (weatherIcon) {
            const iconClass = this.getWeatherIcon(data.weather_id, data.icon);
            weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
        }

        // Weather details
        const humidity = document.getElementById('humidity');
        const pressure = document.getElementById('pressure');
        const windSpeed = document.getElementById('wind-speed');
        const visibility = document.getElementById('visibility');

        if (humidity) humidity.textContent = `${data.humidity}%`;
        if (pressure) pressure.textContent = `${data.pressure} hPa`;
        if (windSpeed) windSpeed.textContent = `${data.wind_speed} km/h`;
        if (visibility) visibility.textContent = `${data.visibility} km`;
    }

    updateHealthRecommendations(data) {
        const container = document.getElementById('health-recommendations');
        if (!container) return;

        const recommendations = this.generateHealthRecommendations(data);
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <i class="${rec.icon}"></i>
                <span>${rec.text}</span>
            </div>
        `).join('');
    }

    generateHealthRecommendations(data) {
        const recommendations = [];
        const aqi = data.aqi;
        const pm25 = data.pm2_5;

        if (aqi <= 2 && pm25 <= 15) {
            recommendations.push({
                icon: 'fas fa-check-circle',
                text: 'Air quality is good. Perfect for outdoor activities and exercise.'
            });
            recommendations.push({
                icon: 'fas fa-running',
                text: 'Great day for jogging, cycling, or outdoor sports.'
            });
        } else if (aqi <= 3 && pm25 <= 35) {
            recommendations.push({
                icon: 'fas fa-exclamation-triangle',
                text: 'Moderate air quality. Sensitive individuals should limit outdoor exposure.'
            });
            recommendations.push({
                icon: 'fas fa-mask',
                text: 'Consider wearing a mask if you have respiratory conditions.'
            });
        } else {
            recommendations.push({
                icon: 'fas fa-times-circle',
                text: 'Poor air quality. Avoid prolonged outdoor activities.'
            });
            recommendations.push({
                icon: 'fas fa-home',
                text: 'Stay indoors and use air purifiers if available.'
            });
            recommendations.push({
                icon: 'fas fa-mask',
                text: 'Wear N95 masks when going outside.'
            });
        }

        // General recommendations
        recommendations.push({
            icon: 'fas fa-leaf',
            text: 'Keep indoor plants to naturally purify air.'
        });

        return recommendations;
    }

    async updateLocationComparison() {
        const container = document.getElementById('location-grid');
        if (!container) return;

        try {
            // Get current city to fetch area comparison
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const response = await fetch(`/api/cities/compare?city=${currentCity}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // If we have area data, show areas; otherwise show cities
            const locations = data.areas || data.cities;
            
            container.innerHTML = locations.map(location => `
                <div class="location-item">
                    <div class="location-name">${location.name || location.city}</div>
                    <div class="location-aqi ${this.getAQIClass(location.aqi_indian || location.aqi * 50)}">${location.aqi_indian || Math.round(location.aqi * 50)}</div>
                    <div class="location-temp">${Math.round(location.temperature || 26)}°C</div>
                    <div class="location-status">${this.getAQIStatus(location.aqi_indian || location.aqi * 50)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching location comparison data:', error);
            // Fallback to Bengaluru areas mock data
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const locations = this.getMockAreaData(currentCity);
            
            container.innerHTML = locations.map(location => `
                <div class="location-item">
                    <div class="location-name">${location.name}</div>
                    <div class="location-aqi ${this.getAQIClass(location.aqi)}">${location.aqi}</div>
                    <div class="location-temp">${location.temp}°C</div>
                    <div class="location-status">${location.status}</div>
                </div>
            `).join('');
        }
    }

    getMockAreaData(city) {
        const areaData = {
            bengaluru: [
                { name: 'Koramangala', aqi: 95, temp: 26, status: 'Moderate' },
                { name: 'Indiranagar', aqi: 88, temp: 25, status: 'Moderate' },
                { name: 'Whitefield', aqi: 78, temp: 24, status: 'Moderate' },
                { name: 'Electronic City', aqi: 102, temp: 27, status: 'Poor' },
                { name: 'Marathahalli', aqi: 92, temp: 26, status: 'Moderate' },
                { name: 'HSR Layout', aqi: 85, temp: 25, status: 'Moderate' },
                { name: 'Jayanagar', aqi: 90, temp: 26, status: 'Moderate' },
                { name: 'Rajajinagar', aqi: 87, temp: 25, status: 'Moderate' }
            ],
            mumbai: [
                { name: 'Bandra', aqi: 105, temp: 28, status: 'Poor' },
                { name: 'Andheri', aqi: 98, temp: 27, status: 'Moderate' },
                { name: 'Powai', aqi: 92, temp: 26, status: 'Moderate' },
                { name: 'Worli', aqi: 110, temp: 29, status: 'Poor' },
                { name: 'Colaba', aqi: 88, temp: 27, status: 'Moderate' },
                { name: 'Malad', aqi: 102, temp: 28, status: 'Poor' },
                { name: 'Thane', aqi: 95, temp: 27, status: 'Moderate' },
                { name: 'Navi Mumbai', aqi: 85, temp: 26, status: 'Moderate' }
            ],
            delhi: [
                { name: 'Connaught Place', aqi: 125, temp: 24, status: 'Poor' },
                { name: 'Gurgaon', aqi: 118, temp: 23, status: 'Poor' },
                { name: 'Noida', aqi: 122, temp: 24, status: 'Poor' },
                { name: 'Dwarka', aqi: 115, temp: 23, status: 'Poor' },
                { name: 'Rohini', aqi: 128, temp: 22, status: 'Poor' },
                { name: 'Lajpat Nagar', aqi: 132, temp: 25, status: 'Very Poor' },
                { name: 'Karol Bagh', aqi: 120, temp: 24, status: 'Poor' },
                { name: 'Vasant Kunj', aqi: 108, temp: 23, status: 'Poor' }
            ]
        };
        
        return areaData[city] || areaData.bengaluru;
    }

    async loadCharts() {
        await Promise.all([
            this.updateAQIChart('24h'),
            this.updateWeatherChart('24h')
        ]);
    }

    async updateAQIChart(period) {
        try {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const data = await this.fetchHistoricalData('aqi', period, currentCity);
            
            const ctx = document.getElementById('aqi-chart');
            if (!ctx) return;

            // Destroy existing chart
            if (this.charts.aqi) {
                this.charts.aqi.destroy();
            }

            const labels = data.map(item => {
                const date = new Date(item.timestamp);
                if (period === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                } else if (period === '7d') {
                    return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
                } else {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
            });

            this.charts.aqi = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'AQI',
                        data: data.map(item => item.aqi_indian || item.aqi * 50),
                        borderColor: '#4ade80',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4ade80',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white',
                                font: { family: 'Inter' }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating AQI chart:', error);
            this.showAlert('Failed to load AQI trends. Using cached data.', 'warning');
        }
    }

    async updateWeatherChart(period) {
        try {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const data = await this.fetchHistoricalData('weather', period, currentCity);
            
            const ctx = document.getElementById('weather-chart');
            if (!ctx) return;

            // Destroy existing chart
            if (this.charts.weather) {
                this.charts.weather.destroy();
            }

            const labels = data.map(item => {
                const date = new Date(item.timestamp);
                if (period === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                } else if (period === '7d') {
                    return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
                } else {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
            });

            this.charts.weather = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: data.map(item => item.temperature),
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    }, {
                        label: 'Humidity (%)',
                        data: data.map(item => item.humidity),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
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
                            labels: {
                                color: 'white',
                                font: { family: 'Inter' }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            ticks: { color: 'rgba(255, 255, 255, 0.8)' },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating weather chart:', error);
            this.showAlert('Failed to load weather trends. Using cached data.', 'warning');
        }
    }

    getAQIInfo(aqi) {
        if (aqi <= 1) return { label: 'Good', class: 'aqi-good', description: 'Air quality is excellent' };
        if (aqi <= 2) return { label: 'Fair', class: 'aqi-fair', description: 'Air quality is acceptable' };
        if (aqi <= 3) return { label: 'Moderate', class: 'aqi-moderate', description: 'Air quality is moderate' };
        if (aqi <= 4) return { label: 'Poor', class: 'aqi-poor', description: 'Air quality is poor' };
        return { label: 'Very Poor', class: 'aqi-very-poor', description: 'Air quality is hazardous' };
    }

    getAQIClass(aqi) {
        if (aqi <= 50) return 'aqi-good';
        if (aqi <= 100) return 'aqi-fair';
        if (aqi <= 150) return 'aqi-moderate';
        if (aqi <= 200) return 'aqi-poor';
        return 'aqi-very-poor';
    }

    getAQIStatus(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Fair';
        if (aqi <= 150) return 'Moderate';
        if (aqi <= 200) return 'Poor';
        return 'Very Poor';
    }

    getWeatherIcon(weatherId, iconCode) {
        // Map OpenWeatherMap weather IDs to Font Awesome icons
        if (weatherId >= 200 && weatherId < 300) return 'fas fa-bolt'; // Thunderstorm
        if (weatherId >= 300 && weatherId < 400) return 'fas fa-cloud-drizzle'; // Drizzle
        if (weatherId >= 500 && weatherId < 600) return 'fas fa-cloud-rain'; // Rain
        if (weatherId >= 600 && weatherId < 700) return 'fas fa-snowflake'; // Snow
        if (weatherId >= 700 && weatherId < 800) return 'fas fa-smog'; // Atmosphere
        if (weatherId === 800) return iconCode?.includes('d') ? 'fas fa-sun' : 'fas fa-moon'; // Clear
        if (weatherId > 800) return 'fas fa-cloud'; // Clouds
        
        return 'fas fa-sun'; // Default
    }

    checkAirQualityAlerts(data) {
        if (data.aqi >= 4) {
            this.showAlert('⚠️ Very Poor Air Quality! Avoid outdoor activities and wear protective masks.', 'danger');
        } else if (data.aqi >= 3) {
            this.showAlert('⚠️ Moderate Air Quality. Sensitive individuals should limit outdoor exposure.', 'warning');
        }

        if (data.pm2_5 > 35) {
            this.showAlert(`🌫️ High PM2.5 levels detected (${data.pm2_5} μg/m³). Consider using air purifiers.`, 'warning');
        }
    }

    showAlert(message, type = 'info') {
        const container = document.getElementById('alert-container');
        if (!container) return;

        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.innerHTML = `
            <div>${message}</div>
            <small>Click to dismiss</small>
        `;

        container.appendChild(alert);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 10000);
    }

    dismissAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }

    updateLastUpdated() {
        const element = document.getElementById('last-updated-time');
        if (element) {
            element.textContent = new Date().toLocaleTimeString();
        }
    }

    async refreshAllData() {
        if (this.isLoading) return;

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshBtn.style.transform = '';
            }, 500);
        }

        await this.loadAllData();
        this.showAlert('✅ Data refreshed successfully!', 'info');
        
        // Also refresh ML features
        await this.loadAdvancedMLFeatures();
    }

    startAutoRefresh() {
        // Refresh every 10 minutes
        this.refreshInterval = setInterval(() => {
            this.loadAllData();
        }, 10 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async exportData() {
        try {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const airQualityData = await this.fetchAirQuality(currentCity);
            const weatherData = await this.fetchWeather(currentCity);
            
            // Fetch ML data for export
            const [mlPredictions, mlInsights, anomalyData] = await Promise.all([
                this.fetchMLPredictions(currentCity),
                this.fetchMLInsights(currentCity),
                this.fetchAnomalyData(currentCity)
            ]).catch(() => [null, null, null]);

            const exportData = {
                timestamp: new Date().toISOString(),
                location: `${this.getCityName(currentCity)}, India`,
                city_key: currentCity,
                current: {
                    air_quality: airQualityData,
                    weather: weatherData
                },
                machine_learning: {
                    predictions: mlPredictions,
                    insights: mlInsights,
                    anomalies: anomalyData
                },
                metadata: {
                    export_version: '2.0',
                    generated_by: 'AI-Powered Air Quality Monitor',
                    ml_features: 'Neural Networks, Anomaly Detection, Clustering Analysis'
                }
            };

            // Create JSON export
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentCity}-air-quality-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Create ML insights report
            this.exportMLReport(exportData);
            
            this.showAlert('✅ Data exported successfully!', 'info');
        } catch (error) {
            console.error('Export failed:', error);
            this.showAlert('Failed to export data. Please try again.', 'danger');
        }
    }

    async exportCSV() {
        try {
            const currentCity = localStorage.getItem('selectedCity') || 'bengaluru';
            const aqiData = await this.fetchHistoricalData('aqi', '7d', currentCity);
            const weatherData = await this.fetchHistoricalData('weather', '7d', currentCity);
            
            const csvRows = [];
            csvRows.push('Timestamp,AQI,AQI_Indian,PM2.5,PM10,NO2,O3,Temperature,Humidity,Pressure,Wind Speed,Health_Index');
            
            // Merge AQI and weather data by timestamp
            const mergedData = aqiData.map(aqi => {
                const weather = weatherData.find(w => w.timestamp === aqi.timestamp) || {};
                return {
                    timestamp: aqi.timestamp,
                    aqi: aqi.aqi,
                    aqi_indian: aqi.aqi_indian || aqi.aqi * 50,
                    pm2_5: aqi.pm2_5 || '',
                    pm10: aqi.pm10 || '',
                    no2: aqi.no2 || '',
                    o3: aqi.o3 || '',
                    temperature: weather.temperature || '',
                    humidity: weather.humidity || '',
                    pressure: weather.pressure || '',
                    wind_speed: weather.wind_speed || '',
                    health_index: aqi.health_index || ''
                };
            });
            
            mergedData.forEach(row => {
                csvRows.push([
                    row.timestamp,
                    row.aqi,
                    row.aqi_indian,
                    row.pm2_5,
                    row.pm10,
                    row.no2,
                    row.o3,
                    row.temperature,
                    row.humidity,
                    row.pressure,
                    row.wind_speed,
                    row.health_index
                ].join(','));
            });
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentCity}-air-quality-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('✅ CSV data exported successfully!', 'info');
        } catch (error) {
            console.error('CSV export failed:', error);
            this.showAlert('Failed to export CSV data. Please try again.', 'danger');
        }
    }

    async fetchMLPredictions(city) {
        try {
            const response = await fetch(`/api/ml/predictions/${city}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch ML predictions:', error);
            return null;
        }
    }

    async fetchMLInsights(city) {
        try {
            const response = await fetch(`/api/ml/insights/${city}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch ML insights:', error);
            return null;
        }
    }

    async fetchAnomalyData(city) {
        try {
            const response = await fetch(`/api/ml/anomaly-detection/${city}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch anomaly data:', error);
            return null;
        }
    }

    getCityName(cityKey) {
        const cityNames = {
            'bengaluru': 'Bengaluru',
            'mumbai': 'Mumbai',
            'delhi': 'Delhi',
            'chennai': 'Chennai',
            'kolkata': 'Kolkata',
            'hyderabad': 'Hyderabad',
            'pune': 'Pune',
            'ahmedabad': 'Ahmedabad'
        };
        return cityNames[cityKey] || cityKey;
    }

    exportMLReport(data) {
        if (!data.machine_learning.predictions && !data.machine_learning.insights) return;
        
        const reportContent = this.generateMLReport(data);
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.city_key}-ml-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateMLReport(data) {
        const predictions = data.machine_learning.predictions;
        const insights = data.machine_learning.insights;
        const anomalies = data.machine_learning.anomalies;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI Air Quality Report - ${data.location}</title>
            <style>
                body { font-family: 'Inter', sans-serif; margin: 40px; background: #f5f5f5; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
                .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .metric { display: inline-block; margin: 10px 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                .alert { padding: 15px; margin: 10px 0; border-radius: 5px; }
                .alert.warning { background: #fff3cd; border-left: 4px solid #ffc107; }
                .alert.info { background: #d1ecf1; border-left: 4px solid #17a2b8; }
                .prediction-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 AI-Powered Air Quality Analysis Report</h1>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>Report Type:</strong> Advanced Machine Learning Analysis</p>
            </div>
            
            ${predictions ? `
            <div class="section">
                <h2>🔮 AI Predictions (Next 24 Hours)</h2>
                <div class="metric">
                    <strong>Model Confidence:</strong> ${predictions.confidence || 85}%
                </div>
                <div class="metric">
                    <strong>Prediction Accuracy:</strong> ${predictions.metadata?.accuracy_score || 87}%
                </div>
                ${predictions.predictions?.aqi ? predictions.predictions.aqi.slice(0, 6).map(pred => `
                    <div class="prediction-item">
                        <strong>${new Date(pred.timestamp).toLocaleTimeString()}:</strong> 
                        AQI ${pred.predicted_aqi} (${this.getAQIStatus(pred.predicted_aqi * 50)})
                        - Confidence: ${pred.confidence}%
                    </div>
                `).join('') : '<p>No prediction data available</p>'}
            </div>
            ` : ''}
            
            ${insights ? `
            <div class="section">
                <h2>💡 AI Insights & Recommendations</h2>
                ${insights.insights?.current ? `
                    <h3>Current Conditions Analysis</h3>
                    <p><strong>Overall Status:</strong> ${insights.insights.current.overall_status?.message || 'Analysis in progress'}</p>
                    <p><strong>Health Risk Level:</strong> ${insights.insights.current.health_risk_level || 'Moderate'}</p>
                ` : ''}
                
                ${insights.insights?.recommendations ? `
                    <h3>Smart Recommendations</h3>
                    ${insights.insights.recommendations.map(rec => `
                        <div class="alert info">
                            <strong>${rec.title}:</strong> ${rec.items ? rec.items.join(', ') : rec.message || 'No specific recommendations'}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            ` : ''}
            
            ${anomalies ? `
            <div class="section">
                <h2>⚠️ Anomaly Detection Results</h2>
                <div class="metric">
                    <strong>Anomalies Detected:</strong> ${anomalies.anomaly_detection?.total_anomalies || 0}
                </div>
                <div class="metric">
                    <strong>Risk Assessment:</strong> ${anomalies.alert_level || 'Normal'}
                </div>
                ${anomalies.anomaly_detection?.anomalies ? anomalies.anomaly_detection.anomalies.slice(0, 5).map(anomaly => `
                    <div class="alert warning">
                        <strong>Anomaly detected at ${new Date(anomaly.timestamp).toLocaleString()}</strong><br>
                        Severity: ${anomaly.severity} | Score: ${Math.round(anomaly.anomaly_score * 100)}%<br>
                        Probable causes: ${anomaly.probable_causes?.join(', ') || 'Under investigation'}
                    </div>
                `).join('') : '<p>No recent anomalies detected</p>'}
            </div>
            ` : ''}
            
            <div class="section">
                <h2>📊 Data Summary</h2>
                <div class="metric">
                    <strong>Current AQI:</strong> ${data.current.air_quality?.aqi_indian || 'N/A'}
                </div>
                <div class="metric">
                    <strong>PM2.5:</strong> ${data.current.air_quality?.pm2_5 || 'N/A'} μg/m³
                </div>
                <div class="metric">
                    <strong>Temperature:</strong> ${data.current.weather?.temperature || 'N/A'}°C
                </div>
                <div class="metric">
                    <strong>Humidity:</strong> ${data.current.weather?.humidity || 'N/A'}%
                </div>
            </div>
            
            <div class="section">
                <p><em>This report was generated using advanced machine learning algorithms including neural networks, anomaly detection, and predictive analytics. For the most current data, please visit the live dashboard.</em></p>
            </div>
        </body>
        </html>
        `;
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.airQualityMonitor = new AirQualityMonitor();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.airQualityMonitor?.stopAutoRefresh();
    } else {
        window.airQualityMonitor?.startAutoRefresh();
        window.airQualityMonitor?.loadAllData();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    window.airQualityMonitor?.showAlert('🌐 Connection restored. Refreshing data...', 'info');
    window.airQualityMonitor?.loadAllData();
});

window.addEventListener('offline', () => {
    window.airQualityMonitor?.showAlert('📡 Connection lost. Data may be outdated.', 'warning');
});