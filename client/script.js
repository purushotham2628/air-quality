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
        
        // Hide loading screen
        this.hideLoading();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshAllData());
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
            
            // Load current data
            const [airQualityData, weatherData] = await Promise.all([
                this.fetchAirQuality(),
                this.fetchWeather()
            ]);

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

    async fetchHistoricalData(type, period = '24h') {
        const response = await fetch(`/api/historical/${type}?period=${period}`);
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
            text: 'Keep indoor plants to improve air quality naturally.'
        });

        return recommendations;
    }

    updateLocationComparison() {
        const container = document.getElementById('location-grid');
        if (!container) return;

        // Mock data for different Bengaluru areas
        const locations = [
            { name: 'Whitefield', aqi: 85, temp: 26, status: 'Moderate' },
            { name: 'Koramangala', aqi: 92, temp: 27, status: 'Moderate' },
            { name: 'Indiranagar', aqi: 78, temp: 26, status: 'Moderate' },
            { name: 'Electronic City', aqi: 88, temp: 25, status: 'Moderate' },
            { name: 'Hebbal', aqi: 95, temp: 28, status: 'Poor' },
            { name: 'Jayanagar', aqi: 82, temp: 27, status: 'Moderate' },
            { name: 'Marathahalli', aqi: 90, temp: 26, status: 'Moderate' },
            { name: 'Banashankari', aqi: 86, temp: 27, status: 'Moderate' }
        ];

        container.innerHTML = locations.map(location => `
            <div class="location-item">
                <div class="location-name">${location.name}</div>
                <div class="location-aqi ${this.getAQIClass(location.aqi)}">${location.aqi}</div>
                <div class="location-temp">${location.temp}°C</div>
                <div class="location-status">${location.status}</div>
            </div>
        `).join('');
    }

    async loadCharts() {
        await Promise.all([
            this.updateAQIChart('24h'),
            this.updateWeatherChart('24h')
        ]);
    }

    async updateAQIChart(period) {
        try {
            const data = await this.fetchHistoricalData('aqi', period);
            
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
        }
    }

    async updateWeatherChart(period) {
        try {
            const data = await this.fetchHistoricalData('weather', period);
            
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