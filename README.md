<h1 align="center">🌟 Bengaluru Air Quality & Weather Monitor</h1>

<p align="center">
  Real-time dashboard for monitoring air quality and weather conditions in Bengaluru, Karnataka.<br>
  Built with Node.js, Express, HTML, CSS, Chart.js, and OpenWeatherMap API.
</p>

<p align="center">
  <img src="client/assets/dashboard-overview.png" alt="Dashboard Overview Screenshot" width="100%">
  <br><br>
  <img src="client/assets/charts-section.png" alt="Charts Section Screenshot" width="100%">
  <br><br>
  <img src="client/assets/mobile-view.png" alt="Mobile View Screenshot" width="100%">
</p>

---

## 🚀 Overview

This project is a **comprehensive and interactive web application** designed to provide real-time environmental monitoring for Bengaluru. The dashboard features:

- 🌡️ **Live Weather Conditions** - Current temperature, humidity, wind, and atmospheric data
- 🌬️ **Real-time Air Quality Monitoring** - AQI levels with detailed pollutant breakdown
- 📊 **Interactive Data Visualization** - Multiple chart types with time-based filtering
- 🏙️ **Multi-location Comparison** - Compare conditions across different areas of Bengaluru
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔄 **Auto-refresh Functionality** - Data updates every 10 minutes automatically
- 🏥 **Health Recommendations** - Personalized advice based on current air quality

The application features a modern glassmorphism UI with smooth animations, hover effects, and an intuitive user experience.

---

## ✨ Key Features

### 🌡️ Weather Dashboard
- **Current Conditions**: Live temperature with "feels like" readings
- **Detailed Metrics**: Wind speed/direction, humidity, pressure, visibility
- **Weather Descriptions**: Animated weather condition descriptions
- **UV Index & Dew Point**: Additional environmental parameters
- **Weather Icons**: Dynamic icons based on current conditions

### 🌬️ Air Quality Insights
- **Real-time AQI Status**: Color-coded levels from Good to Hazardous
- **Pollutant Breakdown**: PM2.5, PM10, NO₂, O₃, CO, SO₂, NH₃ concentrations
- **Visual Progress Bars**: Color-coded bars showing pollutant levels vs. safe limits
- **Historical Comparison**: Compare with yesterday and last week's data
- **Health Impact Indicators**: Clear visual cues for health implications

### 📊 Advanced Data Visualization
- **AQI Trends Chart**: Line chart showing air quality over 24H/7D/30D periods
- **Weather Trends Chart**: Dual-axis chart for temperature and humidity
- **24-Hour Forecast**: Bar chart with hourly temperature/AQI predictions
- **Pollutant Breakdown**: Doughnut chart showing relative pollutant concentrations
- **Interactive Controls**: Time period selection and metric switching
- **Smooth Animations**: Chart transitions and data loading effects

### 🏙️ Location Intelligence
- **Multi-area Monitoring**: Track 8 different areas across Bengaluru
- **Comparative Analysis**: Side-by-side comparison of AQI, temperature, and humidity
- **Location Selector**: Easy switching between monitoring locations
- **Current Location Highlighting**: Visual indication of selected area

### 📅 Forecasting & Trends
- **7-Day Weather Forecast**: Daily high/low temperatures with weather icons
- **AQI Predictions**: Future air quality estimates
- **Trend Analysis**: Visual indicators showing improving/worsening conditions
- **Historical Data**: Access to past 30 days of environmental data

### 🏥 Smart Health Recommendations
- **Activity Guidance**: Personalized advice for outdoor activities
- **Sensitive Group Alerts**: Special recommendations for vulnerable populations
- **Mask Recommendations**: When to wear protective equipment
- **Indoor Air Quality Tips**: Suggestions for maintaining clean indoor air
- **Exercise Guidelines**: Safe activity levels based on current conditions

### 🚨 Alert System
- **Real-time Alerts**: Automatic notifications for poor air quality
- **Threshold Monitoring**: Alerts when pollutants exceed safe levels
- **Dismissible Notifications**: User-controlled alert management
- **Visual Indicators**: Color-coded status throughout the interface

### 🎨 Modern Design & UX
- **Glassmorphism UI**: Translucent cards with backdrop blur effects
- **Gradient Backgrounds**: Beautiful color transitions and visual depth
- **Micro-interactions**: Hover effects, button animations, and transitions
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: Graceful error states with retry options
- **Accessibility**: Keyboard navigation and screen reader support

---

## 📁 Project Structure

```
bengaluru-air-quality-monitor/
├── client/
│   ├── index.html          # Main dashboard HTML
│   ├── style.css           # Complete styling with glassmorphism
│   ├── script.js           # Interactive JavaScript functionality
│   └── assets/
│       ├── dashboard-overview.png
│       ├── charts-section.png
│       └── mobile-view.png
├── server/
│   ├── server.js           # Express server setup
│   └── routes/
│       └── api.js          # API endpoints for weather & air quality
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── LICENSE                 # MIT License
└── README.md              # This file
```

---

## 🔧 Setup & Installation

### 📋 Requirements
- **Node.js** v16 or higher
- **OpenWeatherMap API Key** (free tier available)
- **Modern web browser** with JavaScript enabled

### ⚙️ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/purushotham2628/air-quality.git
cd air-quality

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your OpenWeatherMap API key:
# API_KEY=your_openweathermap_api_key_here
# PORT=3000

# 4. Start the development server
npm start

# 5. Open your browser
# Navigate to http://localhost:3000
```

### 🔑 Getting an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Copy your API key to the `.env` file

---

## 🌐 API Endpoints

| Method | Endpoint                           | Description                                    |
|--------|-----------------------------------|------------------------------------------------|
| GET    | `/api/weather`                    | Current weather data for Bengaluru            |
| GET    | `/api/air-quality`                | Current air quality and pollutant levels      |
| GET    | `/api/historical/aqi?period=24h`  | Historical AQI data (24h/7d/30d)             |
| GET    | `/api/historical/weather?period=24h` | Historical weather data (24h/7d/30d)       |

### 📊 Response Examples

**Weather Data:**
```json
{
  "temperature": 26.5,
  "feels_like": 28.2,
  "humidity": 65,
  "pressure": 1013,
  "description": "partly cloudy",
  "wind_speed": 12.5,
  "visibility": 10,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**Air Quality Data:**
```json
{
  "aqi": 3,
  "pm2_5": 25.4,
  "pm10": 45.2,
  "no2": 18.7,
  "o3": 85.3,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

---

## 🔄 Features & Functionality

### ⚡ Real-time Updates
- **Auto-refresh**: Data refreshes every 10 minutes automatically
- **Manual refresh**: Click the refresh button or press `Ctrl+R`
- **Live timestamps**: Shows when data was last updated
- **Loading indicators**: Visual feedback during data fetching

### 🎛️ Interactive Controls
- **Chart time periods**: Switch between 24H, 7D, and 30D views
- **Location selector**: Choose from 8 different Bengaluru areas
- **Metric comparison**: Toggle between AQI, temperature, and humidity
- **Forecast toggle**: Switch between temperature and AQI forecasts

### 📱 Responsive Design
- **Mobile-first**: Optimized for smartphones and tablets
- **Adaptive layouts**: Grid systems that adjust to screen size
- **Touch-friendly**: Large buttons and touch targets
- **Performance optimized**: Fast loading on all devices

### ⌨️ Keyboard Shortcuts
- **Ctrl+R**: Refresh all data
- **Escape**: Dismiss alerts and notifications
- **Tab navigation**: Full keyboard accessibility

---

## 🧪 Development

### 🛠️ Development Mode
```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Start development server with auto-reload
npm run dev
```

### 🔍 Debugging
- Open browser developer tools (F12)
- Check console for error messages
- Network tab shows API request/response data
- Use `window.airQualityMonitor` object for debugging

### 🧪 Testing API Endpoints
```bash
# Test weather endpoint
curl http://localhost:3000/api/weather

# Test air quality endpoint
curl http://localhost:3000/api/air-quality

# Test historical data
curl "http://localhost:3000/api/historical/aqi?period=24h"
```

---

## 💡 Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Vanilla JavaScript**: ES6+ features, async/await, fetch API
- **Chart.js**: Interactive and responsive data visualization
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Inter font family for typography

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **dotenv**: Environment variable management
- **OpenWeatherMap API**: Weather and air pollution data

### Design & UX
- **Glassmorphism**: Modern UI design trend
- **Responsive Design**: Mobile-first approach
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Animations**: Smooth transitions and micro-interactions

---

## 📊 Data Sources

### Weather Data
- **Provider**: OpenWeatherMap Current Weather API
- **Update Frequency**: Every 10 minutes
- **Coverage**: Bengaluru metropolitan area
- **Parameters**: Temperature, humidity, pressure, wind, visibility

### Air Quality Data
- **Provider**: OpenWeatherMap Air Pollution API
- **Update Frequency**: Every 10 minutes
- **Pollutants**: PM2.5, PM10, NO₂, O₃, CO, SO₂, NH₃
- **Standards**: WHO Air Quality Guidelines

### Historical Data
- **Retention**: 30 days of historical data
- **Granularity**: Hourly data points
- **Trends**: Statistical analysis and pattern recognition

---

## 🔒 Security & Performance

### Security Features
- **Environment Variables**: API keys stored securely
- **Input Validation**: Sanitized API responses
- **Error Handling**: Graceful failure states
- **CORS Protection**: Controlled cross-origin requests

### Performance Optimizations
- **Caching**: Browser caching for static assets
- **Compression**: Gzipped responses
- **Lazy Loading**: Charts load on demand
- **Debounced Updates**: Prevents excessive API calls
- **Optimized Images**: Compressed screenshots and assets

### Rate Limiting
- **API Calls**: Limited to prevent quota exhaustion
- **Auto-refresh**: Intelligent timing to balance freshness and limits
- **Error Recovery**: Automatic retry with exponential backoff

---

## 📞 Troubleshooting

### Common Issues

**🚫 Charts not displaying?**
- Verify Chart.js is loaded correctly
- Check browser console for JavaScript errors
- Ensure canvas elements exist in DOM
- Try refreshing the page

**📡 Data not loading?**
- Check `.env` file configuration
- Verify API key is valid and active
- Check network connectivity
- Review server logs for errors

**🎨 Styling issues?**
- Clear browser cache
- Check CSS file is loading
- Verify no conflicting styles
- Test in different browsers

**📱 Mobile display problems?**
- Check viewport meta tag
- Test responsive breakpoints
- Verify touch interactions work
- Check for horizontal scrolling

### Debug Commands
```bash
# Check server status
curl http://localhost:3000/api/weather

# View server logs
npm start

# Test API key
echo $API_KEY

# Check dependencies
npm list
```

---

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

### Environment Variables
```bash
# Production .env file
API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure mobile compatibility
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[OpenWeatherMap](https://openweathermap.org/)** - Weather and air quality data
- **[Chart.js](https://www.chartjs.org/)** - Beautiful and responsive charts
- **[Font Awesome](https://fontawesome.com/)** - Comprehensive icon library
- **[Google Fonts](https://fonts.google.com/specimen/Inter)** - Inter font family
- **[MDN Web Docs](https://developer.mozilla.org/)** - Web development resources
- **[CSS-Tricks](https://css-tricks.com/)** - CSS techniques and best practices

---

## 📈 Future Enhancements

- **🔔 Push Notifications**: Browser notifications for air quality alerts
- **📍 GPS Location**: Automatic location detection
- **🌍 Multi-city Support**: Expand to other Indian cities
- **📊 Advanced Analytics**: Machine learning predictions
- **💾 Data Export**: Download historical data as CSV/JSON
- **🎨 Theme Customization**: Dark/light mode toggle
- **🔗 Social Sharing**: Share air quality reports
- **📱 PWA Support**: Offline functionality and app-like experience

---

<p align="center">
  <strong>Made with ❤️ for a cleaner, smarter Bengaluru 🌱</strong><br>
  <em>Monitoring today for a better tomorrow</em>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-setup--installation">Setup</a> •
  <a href="#-features--functionality">Features</a> •
  <a href="#-troubleshooting">Troubleshooting</a> •
  <a href="#-contributing">Contributing</a>
</p>