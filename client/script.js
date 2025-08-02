// Global variables
let aqiChart, weatherChart, forecastChart, pollutantChart;
let currentLocation = 'central';
let refreshInterval;
let updateCountdown;
let nextUpdateTime = 600; // 10 minutes in seconds

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Air Quality Monitor initialized');
    
    // Initialize components
    initializeEventListeners();
    initializeCharts();
    loadInitialData();
    startAutoRefresh();
    startUpdateCountdown();
    
    // Hide loading overlay after initialization
    setTimeout(() => {
        hideLoadingOverlay();
    }, 1000);
});

// Event Listeners
function initializeEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }

    // Location selector
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.addEventListener('change', handleLocationChange);
    }

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }

    // Chart controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', handleChartPeriodChange);
    });

    // Comparison controls
    document.querySelectorAll('.comparison-btn').forEach(btn => {
        btn.addEventListener('click', handleComparisonMetricChange);
    });

    // Forecast toggle
    document.querySelectorAll('[data-forecast]').forEach(btn => {
        btn.addEventListener('click', handleForecastToggle);
    });

    // Alert dismiss
    const dismissBtn = document.getElementById('dismissAlerts');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissAlerts);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Initialize Charts
function initializeCharts() {
    try {
        // AQI Chart
        const aqiCtx = document.getElementById('aqiChart');
        if (aqiCtx) {
            aqiChart = new Chart(aqiCtx, {
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
                        pointRadius: 6,
                        pointHoverRadius: 8
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
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
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
            weatherChart = new Chart(weatherCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: [],
                            borderColor: '#f56565',
                            backgroundColor: 'rgba(245, 101, 101, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Humidity (%)',
                            data: [],
                            borderColor: '#4299e1',
                            backgroundColor: 'rgba(66, 153, 225, 0.1)',
                            borderWidth: 3,
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
                                color: 'rgba(0, 0, 0, 0.1)'
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
                                color: 'rgba(0, 0, 0, 0.1)'
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

        // Forecast Chart
        const forecastCtx = document.getElementById('forecastChart');
        if (forecastCtx) {
            forecastChart = new Chart(forecastCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: [],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        borderRadius: 8
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
                            beginAtZero: false,
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
        }

        // Pollutant Chart
        const pollutantCtx = document.getElementById('pollutantChart');
        if (pollutantCtx) {
            pollutantChart = new Chart(pollutantCtx, {
                type: 'doughnut',
                data: {
                    labels: ['PM2.5', 'PM10', 'NO₂', 'O₃'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#f56565',
                            '#ed8936',
                            '#ecc94b',
                            '#48bb78'
                        ],
                        borderWidth: 0,
                        cutout: '60%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

        console.log('📊 Charts initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
        showErrorToast('Failed to initialize charts');
    }
}

// Load initial data
async function loadInitialData() {
    showLoadingOverlay();
    
    try {
        await Promise.all([
            loadWeatherData(),
            loadAirQualityData(),
            loadHistoricalData(),
            loadLocationComparison(),
            loadWeeklyForecast()
        ]);
        
        updateLastUpdated();
        console.log('✅ Initial data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        showErrorToast('Failed to load initial data');
    } finally {
        hideLoadingOverlay();
    }
}

// Weather Data
async function loadWeatherData() {
    try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateWeatherDisplay(data);
        updateSummaryDisplay(data);
    } catch (error) {
        console.error('❌ Error loading weather data:', error);
        showErrorToast('Failed to load weather data');
    }
}

// Air Quality Data
async function loadAirQualityData() {
    try {
        const response = await fetch('/api/air-quality');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        updateAirQualityDisplay(data);
        updateHealthRecommendations(data.aqi);
        checkAirQualityAlerts(data);
        
        // Update pollutant chart
        if (pollutantChart) {
            pollutantChart.data.datasets[0].data = [
                data.pm2_5 || 0,
                data.pm10 || 0,
                data.no2 || 0,
                data.o3 || 0
            ];
            pollutantChart.update();
        }
    } catch (error) {
        console.error('❌ Error loading air quality data:', error);
        showErrorToast('Failed to load air quality data');
    }
}

// Historical Data
async function loadHistoricalData() {
    try {
        const [aqiData, weatherData] = await Promise.all([
            fetch('/api/historical/aqi?period=24h').then(r => r.json()),
            fetch('/api/historical/weather?period=24h').then(r => r.json())
        ]);

        updateAQIChart(aqiData);
        updateWeatherChart(weatherData);
        updateForecastChart();
    } catch (error) {
        console.error('❌ Error loading historical data:', error);
        showErrorToast('Failed to load historical data');
    }
}

// Update Weather Display
function updateWeatherDisplay(data) {
    const elements = {
        temperature: document.getElementById('temperature'),
        feelsLike: document.getElementById('feelsLike'),
        weatherDescription: document.getElementById('weatherDescription'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        visibility: document.getElementById('visibility'),
        pressure: document.getElementById('pressure'),
        uvIndex: document.getElementById('uvIndex'),
        dewPoint: document.getElementById('dewPoint'),
        weatherIcon: document.getElementById('weatherIcon')
    };

    if (elements.temperature) elements.temperature.textContent = `${Math.round(data.temperature)}°`;
    if (elements.feelsLike) elements.feelsLike.textContent = `${Math.round(data.feels_like)}°C`;
    if (elements.weatherDescription) elements.weatherDescription.textContent = data.description;
    if (elements.humidity) elements.humidity.textContent = `${data.humidity}%`;
    if (elements.windSpeed) elements.windSpeed.textContent = `${Math.round(data.wind_speed)} km/h`;
    if (elements.visibility) elements.visibility.textContent = `${data.visibility} km`;
    if (elements.pressure) elements.pressure.textContent = `${data.pressure} hPa`;
    if (elements.uvIndex) elements.uvIndex.textContent = calculateUVIndex(data.temperature, data.humidity);
    if (elements.dewPoint) elements.dewPoint.textContent = `${calculateDewPoint(data.temperature, data.humidity)}°C`;

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

// Calculate UV Index based on temperature and time
function calculateUVIndex(temperature, humidity) {
    const hour = new Date().getHours();
    let baseUV = 0;
    
    if (hour >= 10 && hour <= 16) {
        baseUV = Math.max(0, Math.min(11, (temperature - 15) / 5 + (100 - humidity) / 20));
    } else if (hour >= 8 && hour <= 18) {
        baseUV = Math.max(0, Math.min(8, (temperature - 20) / 8 + (100 - humidity) / 30));
    }
    
    return Math.round(baseUV);
}

// Calculate Dew Point
function calculateDewPoint(temperature, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
}

// Update Air Quality Display
function updateAirQualityDisplay(data) {
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
    updatePollutantBar('pm25', data.pm2_5, 25);
    updatePollutantBar('pm10', data.pm10, 50);
    updatePollutantBar('no2', data.no2, 40);
    updatePollutantBar('o3', data.o3, 120);

    // Update comparison values (mock data)
    const aqiYesterday = document.getElementById('aqiYesterday');
    const aqiLastWeek = document.getElementById('aqiLastWeek');
    if (aqiYesterday) aqiYesterday.textContent = Math.max(1, data.aqi + Math.floor(Math.random() * 3) - 1);
    if (aqiLastWeek) aqiLastWeek.textContent = Math.max(1, data.aqi + Math.floor(Math.random() * 3) - 1);
}

// Update Summary Display
function updateSummaryDisplay(weatherData) {
    const summaryTemp = document.getElementById('summaryTemp');
    const summaryHumidity = document.getElementById('summaryHumidity');
    const summaryUV = document.getElementById('summaryUV');

    if (summaryTemp) summaryTemp.textContent = `${weatherData.temperature}°C`;
    if (summaryHumidity) summaryHumidity.textContent = `${weatherData.humidity}%`;
    if (summaryUV) summaryUV.textContent = 'Moderate'; // Mock UV data
    
    // Update summary AQI
    const summaryAqi = document.getElementById('summaryAqi');
    if (summaryAqi) {
        // This will be updated when air quality data is loaded
        summaryAqi.textContent = 'Loading...';
    }
}

// Update Pollutant Bar
function updatePollutantBar(pollutant, value, maxValue) {
    const valueElement = document.getElementById(pollutant);
    const barElement = document.getElementById(`${pollutant}Bar`);

    if (valueElement) valueElement.textContent = `${value} μg/m³`;
    if (barElement) {
        const percentage = Math.min((value / maxValue) * 100, 100);
        barElement.style.width = `${percentage}%`;
        
        // Color based on percentage
        if (percentage <= 50) {
            barElement.className = 'fill';
            barElement.style.background = 'linear-gradient(90deg, #48bb78, #68d391)';
        } else if (percentage <= 75) {
            barElement.className = 'fill';
            barElement.style.background = 'linear-gradient(90deg, #ed8936, #f6ad55)';
        } else {
            barElement.className = 'fill';
            barElement.style.background = 'linear-gradient(90deg, #f56565, #fc8181)';
        }
    }
}

// Enhanced pollutant bar colors based on WHO guidelines
function getPollutantColor(pollutant, value) {
    const thresholds = {
        pm25: [12, 25, 37.5, 75],
        pm10: [25, 50, 75, 150],
        no2: [25, 50, 100, 200],
        o3: [60, 120, 180, 240]
    };
    
    const levels = thresholds[pollutant] || [25, 50, 75, 100];
    
    if (value <= levels[0]) return 'linear-gradient(90deg, #4facfe, #00f2fe)';
    if (value <= levels[1]) return 'linear-gradient(90deg, #43e97b, #38f9d7)';
    if (value <= levels[2]) return 'linear-gradient(90deg, #f093fb, #f5576c)';
    if (value <= levels[3]) return 'linear-gradient(90deg, #fa709a, #fee140)';
    return 'linear-gradient(90deg, #2c3e50, #34495e)';
}

// Update Charts
function updateAQIChart(data) {
    if (!aqiChart || !data || data.length === 0) return;

    const labels = data.map(item => {
        const date = new Date(item.timestamp);
        return date.getHours() + ':00';
    });

    const aqiData = data.map(item => item.aqi);

    aqiChart.data.labels = labels;
    aqiChart.data.datasets[0].data = aqiData;
    aqiChart.update();
}

function updateWeatherChart(data) {
    if (!weatherChart || !data || data.length === 0) return;

    const labels = data.map(item => {
        const date = new Date(item.timestamp);
        return date.getHours() + ':00';
    });

    const tempData = data.map(item => item.temperature);
    const humidityData = data.map(item => item.humidity);

    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = tempData;
    weatherChart.data.datasets[1].data = humidityData;
    weatherChart.update();
}

function updateForecastChart() {
    if (!forecastChart) return;

    // Generate mock forecast data
    const hours = [];
    const temps = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
        const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
        hours.push(hour.getHours() + ':00');
        temps.push(Math.round(25 + Math.sin(i * 0.3) * 8 + Math.random() * 4));
    }

    forecastChart.data.labels = hours;
    forecastChart.data.datasets[0].data = temps;
    forecastChart.update();
}

// Location Comparison
async function loadLocationComparison() {
    // Generate more realistic location data with variations
    const baseTemp = 26;
    const baseHumidity = 65;
    const baseAqi = 3;
    
    const locations = [
        { 
            name: 'Central Bengaluru', 
            aqi: baseAqi, 
            temp: baseTemp + (Math.random() - 0.5) * 4, 
            humidity: baseHumidity + (Math.random() - 0.5) * 10 
        },
        { 
            name: 'Whitefield', 
            aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
            temp: baseTemp - 2 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity + 5 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Koramangala', 
            aqi: baseAqi + Math.floor(Math.random() * 2), 
            temp: baseTemp + 1 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity - 3 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Electronic City', 
            aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
            temp: baseTemp - 1 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity + 3 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Hebbal', 
            aqi: Math.min(5, baseAqi + 1 + Math.floor(Math.random() * 2)), 
            temp: baseTemp + 2 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity - 5 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Jayanagar', 
            aqi: baseAqi + Math.floor(Math.random() * 2), 
            temp: baseTemp + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity + 1 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Marathahalli', 
            aqi: Math.max(1, baseAqi - 1 + Math.floor(Math.random() * 2)), 
            temp: baseTemp - 1 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity + 4 + (Math.random() - 0.5) * 8 
        },
        { 
            name: 'Indiranagar', 
            aqi: baseAqi + Math.floor(Math.random() * 2), 
            temp: baseTemp + 1 + (Math.random() - 0.5) * 3, 
            humidity: baseHumidity - 2 + (Math.random() - 0.5) * 8 
        }
    ];
    
    // Round values for display
    locations.forEach(location => {
        location.temp = Math.round(location.temp);
        location.humidity = Math.round(location.humidity);
    });

    updateLocationComparison(locations, 'aqi');
}

function updateLocationComparison(locations, metric) {
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
                    1: { status: 'Good', class: 'aqi-good' },
                    2: { status: 'Fair', class: 'aqi-fair' },
                    3: { status: 'Moderate', class: 'aqi-moderate' },
                    4: { status: 'Poor', class: 'aqi-poor' },
                    5: { status: 'Very Poor', class: 'aqi-very-poor' }
                };
                status = aqiLevels[value].status;
                statusClass = aqiLevels[value].class;
                break;
            case 'temp':
                value = `${location.temp}°C`;
                status = location.temp > 32 ? 'Very Hot' : location.temp > 28 ? 'Hot' : location.temp > 24 ? 'Warm' : 'Cool';
                statusClass = location.temp > 32 ? 'aqi-very-poor' : location.temp > 28 ? 'aqi-poor' : location.temp > 24 ? 'aqi-fair' : 'aqi-good';
                break;
            case 'humidity':
                value = `${location.humidity}%`;
                status = location.humidity > 80 ? 'Very High' : location.humidity > 70 ? 'High' : location.humidity > 50 ? 'Moderate' : 'Low';
                statusClass = location.humidity > 80 ? 'aqi-very-poor' : location.humidity > 70 ? 'aqi-poor' : location.humidity > 50 ? 'aqi-fair' : 'aqi-good';
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

// Weekly Forecast
async function loadWeeklyForecast() {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weatherConditions = [
        { icon: 'fas fa-sun', condition: 'sunny' },
        { icon: 'fas fa-cloud-sun', condition: 'partly-cloudy' },
        { icon: 'fas fa-cloud', condition: 'cloudy' },
        { icon: 'fas fa-cloud-rain', condition: 'rainy' },
        { icon: 'fas fa-sun', condition: 'sunny' },
        { icon: 'fas fa-cloud-sun', condition: 'partly-cloudy' },
        { icon: 'fas fa-cloud', condition: 'cloudy' }
    ];
    
    const forecastGrid = document.getElementById('weeklyForecast');
    if (!forecastGrid) return;

    forecastGrid.innerHTML = '';

    days.forEach((day, index) => {
        // More realistic temperature variations
        const baseTemp = 26;
        const tempVariation = Math.sin(index * 0.5) * 4 + (Math.random() - 0.5) * 3;
        const high = Math.round(baseTemp + tempVariation + 3);
        const low = Math.round(high - 6 - Math.random() * 4);
        
        // AQI tends to be worse on certain days (weekends better due to less traffic)
        const isWeekend = index === 5 || index === 6;
        const baseAqi = isWeekend ? 2 : 3;
        const aqi = Math.max(1, Math.min(5, baseAqi + Math.floor(Math.random() * 2)));
        
        const aqiLevels = {
            1: { level: 'Good', class: 'aqi-good' },
            2: { level: 'Fair', class: 'aqi-fair' },
            3: { level: 'Moderate', class: 'aqi-moderate' },
            4: { level: 'Poor', class: 'aqi-poor' },
            5: { level: 'Very Poor', class: 'aqi-very-poor' }
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

// Health Recommendations
function updateHealthRecommendations(aqi) {
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
                'Windows can be kept open for natural ventilation',
                'No health precautions needed'
            ]
        },
        2: {
            icon: 'fas fa-thumbs-up',
            class: 'fair',
            title: 'Good Air Quality',
            advice: [
                'Suitable for all outdoor activities',
                'Ideal for morning walks and exercise',
                'Sensitive individuals should monitor symptoms',
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
                'Consider wearing a mask during outdoor activities',
                'Keep windows closed during peak pollution hours'
            ]
        },
        4: {
            icon: 'fas fa-times-circle',
            class: 'poor',
            title: 'Poor Air Quality',
            advice: [
                'Avoid outdoor activities, especially for sensitive groups',
                'Wear N95 masks when going outside',
                'Keep windows and doors closed',
                'Use air purifiers indoors if available',
                'Postpone outdoor exercise'
            ]
        },
        5: {
            icon: 'fas fa-skull-crossbones',
            class: 'very-poor',
            title: 'Very Poor Air Quality',
            advice: [
                'Stay indoors as much as possible',
                'Avoid all outdoor physical activities',
                'Wear high-quality masks (N95/N99) when outside',
                'Seek medical attention if experiencing symptoms',
                'Use air purifiers and keep indoor air clean'
            ]
        }
    };

    const rec = recommendations[aqi] || recommendations[3];
    
    healthAdvice.innerHTML = `
        <div class="recommendation-item ${rec.class}">
            <i class="${rec.icon}"></i>
            <div>
                <strong>${rec.title}</strong>
                ${rec.advice.map(advice => `<p>${advice}</p>`).join('')}
            </div>
        </div>
    `;
}

// Air Quality Alerts
function checkAirQualityAlerts(data) {
    const alertsSection = document.getElementById('alertsSection');
    const alertContent = document.getElementById('alertContent');
    
    if (!alertsSection || !alertContent) return;

    if (data.aqi >= 4) {
        const alerts = [];
        
        if (data.pm2_5 > 35) {
            alerts.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'High PM2.5 Levels',
                description: `PM2.5 concentration is ${data.pm2_5} μg/m³, which exceeds safe levels.`
            });
        }
        
        if (data.pm10 > 50) {
            alerts.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'High PM10 Levels',
                description: `PM10 concentration is ${data.pm10} μg/m³, which exceeds safe levels.`
            });
        }

        if (alerts.length > 0) {
            alertContent.innerHTML = alerts.map(alert => `
                <div class="alert-item">
                    <i class="alert-icon ${alert.icon}"></i>
                    <div class="alert-text">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-description">${alert.description}</div>
                    </div>
                </div>
            `).join('');
            
            alertsSection.style.display = 'block';
        } else {
            alertsSection.style.display = 'none';
        }
    } else {
        alertsSection.style.display = 'none';
    }
}

// Event Handlers
async function handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
    }

    try {
        await loadInitialData();
        showSuccessToast('Data refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showErrorToast('Failed to refresh data');
    } finally {
        if (refreshBtn) {
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
        }
    }
}

function handleLocationChange(event) {
    currentLocation = event.target.value;
    console.log(`📍 Location changed to: ${currentLocation}`);
    
    // Update current location display
    const currentLocationSpan = document.getElementById('currentLocation');
    if (currentLocationSpan) {
        const locationNames = {
            'central': 'Central Bengaluru',
            'whitefield': 'Whitefield',
            'koramangala': 'Koramangala',
            'indiranagar': 'Indiranagar',
            'electronic-city': 'Electronic City',
            'hebbal': 'Hebbal',
            'jayanagar': 'Jayanagar',
            'marathahalli': 'Marathahalli'
        };
        currentLocationSpan.textContent = locationNames[currentLocation] || 'Bengaluru, Karnataka';
    }
    
    // Reload data for new location
    loadInitialData();
}

async function handleShare() {
    try {
        const shareData = {
            title: 'Bengaluru Air Quality Monitor',
            text: 'Check out the current air quality and weather conditions in Bengaluru!',
            url: window.location.href
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            showSuccessToast('Link copied to clipboard');
        }
    } catch (error) {
        console.error('❌ Error sharing:', error);
        showErrorToast('Failed to share');
    }
}

async function handleChartPeriodChange(event) {
    const period = event.target.dataset.period;
    const chartContainer = event.target.closest('.chart-container');
    
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
            updateAQIChart(aqiData);
        } else if (chartContainer.querySelector('#weatherChart')) {
            updateWeatherChart(weatherData);
        }
    } catch (error) {
        console.error('❌ Error updating chart:', error);
        showErrorToast('Failed to update chart');
    }
}

function handleComparisonMetricChange(event) {
    const metric = event.target.dataset.metric;
    
    // Update active button
    document.querySelectorAll('.comparison-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Mock location data
    const locations = [
        { name: 'Central Bengaluru', aqi: 3, temp: 26, humidity: 65 },
        { name: 'Whitefield', aqi: 2, temp: 24, humidity: 70 },
        { name: 'Koramangala', aqi: 3, temp: 27, humidity: 62 },
        { name: 'Electronic City', aqi: 2, temp: 25, humidity: 68 },
        { name: 'Hebbal', aqi: 4, temp: 28, humidity: 60 },
        { name: 'Jayanagar', aqi: 3, temp: 26, humidity: 66 },
        { name: 'Marathahalli', aqi: 2, temp: 25, humidity: 69 },
        { name: 'Indiranagar', aqi: 3, temp: 27, humidity: 63 }
    ];

    updateLocationComparison(locations, metric);
}

function handleForecastToggle(event) {
    const forecastType = event.target.dataset.forecast;
    
    // Update active button
    document.querySelectorAll('[data-forecast]').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update forecast chart based on type
    if (forecastChart) {
        if (forecastType === 'aqi') {
            forecastChart.data.datasets[0].label = 'AQI';
            forecastChart.data.datasets[0].backgroundColor = 'rgba(245, 101, 101, 0.8)';
            forecastChart.data.datasets[0].borderColor = '#f56565';
            
            // Generate mock AQI forecast data
            const aqiData = [];
            for (let i = 0; i < 24; i++) {
                aqiData.push(Math.floor(Math.random() * 3) + 2);
            }
            forecastChart.data.datasets[0].data = aqiData;
        } else {
            forecastChart.data.datasets[0].label = 'Temperature (°C)';
            forecastChart.data.datasets[0].backgroundColor = 'rgba(102, 126, 234, 0.8)';
            forecastChart.data.datasets[0].borderColor = '#667eea';
            
            // Generate mock temperature forecast data
            const tempData = [];
            for (let i = 0; i < 24; i++) {
                tempData.push(Math.round(25 + Math.sin(i * 0.3) * 8 + Math.random() * 4));
            }
            forecastChart.data.datasets[0].data = tempData;
        }
        
        forecastChart.update();
    }
}

function dismissAlerts() {
    const alertsSection = document.getElementById('alertsSection');
    if (alertsSection) {
        alertsSection.style.display = 'none';
    }
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R: Refresh data
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleRefresh();
    }
    
    // Escape: Dismiss alerts
    if (event.key === 'Escape') {
        dismissAlerts();
    }
}

// Utility Functions
function updateLastUpdated() {
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = `Updated at ${now.toLocaleTimeString()}`;
    }
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function showErrorToast(message) {
    // Remove existing toasts
    document.querySelectorAll('.error-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
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

function showSuccessToast(message) {
    // Remove existing toasts
    document.querySelectorAll('.error-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Start update countdown
function startUpdateCountdown() {
    updateCountdown = setInterval(() => {
        nextUpdateTime--;
        
        const minutes = Math.floor(nextUpdateTime / 60);
        const seconds = nextUpdateTime % 60;
        
        const nextUpdateElement = document.getElementById('nextUpdate');
        if (nextUpdateElement) {
            if (minutes > 0) {
                nextUpdateElement.textContent = `${minutes}m ${seconds}s`;
            } else {
                nextUpdateElement.textContent = `${seconds}s`;
            }
        }
        
        if (nextUpdateTime <= 0) {
            nextUpdateTime = 600; // Reset to 10 minutes
        }
    }, 1000);
}

// Auto-refresh functionality
function startAutoRefresh() {
    // Refresh data every 10 minutes
    refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        loadInitialData();
        nextUpdateTime = 600; // Reset countdown
    }, 10 * 60 * 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    if (updateCountdown) {
        clearInterval(updateCountdown);
    }
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.feature-title').textContent;
            showSuccessToast(`${title} feature coming soon!`);
        });
    });
    
    // Add click handlers for stats
    document.querySelectorAll('.stat-item').forEach(item => {
        item.addEventListener('click', function() {
            const label = this.querySelector('.stat-label').textContent;
            showSuccessToast(`${label} details will be available in the next update!`);
        });
    });
    
    // Add hover effects for summary items
    document.querySelectorAll('.summary-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Export for debugging
window.airQualityMonitor = {
    loadInitialData,
    handleRefresh,
    showErrorToast,
    showSuccessToast
};