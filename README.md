# 🌟 Bengaluru Air Quality & Weather Monitor

A beautiful, real-time dashboard for monitoring air quality and weather conditions in Bengaluru, Karnataka. Built with modern web technologies and featuring stunning visualizations, health recommendations, and responsive design.

![Dashboard Preview](https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## ✨ Features

### 🌡️ Real-time Weather Data
- **Current Temperature** with feels-like temperature
- **Weather Conditions** with animated icons
- **Humidity, Wind Speed, Visibility** and atmospheric pressure
- **Beautiful Animations** for smooth data transitions

### 🌬️ Air Quality Monitoring
- **Real-time AQI** (Air Quality Index) with color-coded indicators
- **Pollutant Levels** including PM2.5, PM10, NO₂, and O₃
- **Visual Progress Bars** showing pollutant concentrations
- **Health Impact Assessment** based on current conditions

### 📊 Interactive Charts
- **Historical Trends** for both air quality and weather data
- **Multiple Time Periods** (24 hours, 7 days, 30 days)
- **Smooth Animations** and hover interactions
- **Responsive Design** that works on all devices

### 🏥 Health Recommendations
- **Personalized Advice** based on current air quality
- **Activity Suggestions** for different AQI levels
- **Safety Precautions** for sensitive groups
- **Visual Indicators** for quick understanding

### 🎨 Modern UI/UX
- **Glassmorphism Design** with backdrop blur effects
- **Gradient Backgrounds** and smooth animations
- **Responsive Layout** for mobile, tablet, and desktop
- **Accessibility Features** including keyboard navigation
- **Dark/Light Theme** support

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bengaluru-air-quality-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeatherMap API key:
   ```env
   API_KEY=your_openweathermap_api_key_here
   PORT=3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | OpenWeatherMap API key | Yes | - |
| `PORT` | Server port number | No | 3000 |

### Getting an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API keys section
4. Generate a new API key
5. Copy the key to your `.env` file

## 📁 Project Structure

```
bengaluru-air-quality-monitor/
├── client/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styles and animations
│   └── script.js          # Frontend JavaScript
├── server/                # Backend files
│   ├── server.js          # Express server
│   └── routes/
│       └── api.js         # API routes
├── .env.example           # Environment variables template
├── package.json           # Project dependencies
└── README.md             # This file
```

## 🌐 API Endpoints

### Weather Data
```
GET /api/weather
```
Returns current weather conditions for Bengaluru including temperature, humidity, wind speed, and more.

### Air Quality Data
```
GET /api/air-quality
```
Returns current air quality index and pollutant levels including PM2.5, PM10, NO₂, and O₃.

### Historical Data
```
GET /api/historical/:type?period=24h
```
Returns historical data for charts. Type can be `aqi` or `weather`. Period can be `24h`, `7d`, or `30d`.

## 🎨 Design Features

### Color Scheme
- **Primary**: Gradient from #667eea to #764ba2
- **Success**: #48bb78 (Good air quality)
- **Warning**: #ed8936 (Fair air quality)
- **Error**: #f56565 (Poor air quality)
- **Info**: #4299e1 (General information)

### Typography
- **Font Family**: Inter (with fallbacks)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately on all devices

### Animations
- **Smooth Transitions**: CSS cubic-bezier easing
- **Hover Effects**: Subtle lift and shadow changes
- **Loading States**: Spinning animations and shimmer effects
- **Data Updates**: Animated value changes

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:

- **Desktop** (1200px+): Full layout with side-by-side cards
- **Tablet** (768px - 1199px): Adjusted spacing and layout
- **Mobile** (320px - 767px): Stacked layout with touch-friendly controls

## 🔒 Security Features

- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: API responses validated and sanitized
- **Error Handling**: Graceful error handling with user feedback
- **Rate Limiting**: Built-in protection against API abuse

## 🌍 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📊 Data Sources

- **Weather Data**: OpenWeatherMap Current Weather API
- **Air Quality Data**: OpenWeatherMap Air Pollution API
- **Location**: Bengaluru, Karnataka (12.9716°N, 77.5946°E)

## 🔄 Auto-Refresh

The dashboard automatically refreshes data every 10 minutes to ensure you always have the latest information. You can also manually refresh using the refresh button or `Ctrl+R` keyboard shortcut.

## 🏥 Health Guidelines

The health recommendations are based on standard AQI guidelines:

- **Good (1)**: No health implications
- **Fair (2)**: Acceptable for most people
- **Moderate (3)**: Sensitive groups may experience minor issues
- **Poor (4)**: Health effects for sensitive groups
- **Very Poor (5)**: Health warnings for everyone

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### Code Structure
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Backend**: Node.js with Express framework
- **Charts**: Chart.js for beautiful data visualizations
- **Styling**: Pure CSS with modern features (Grid, Flexbox, Custom Properties)

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**API Key Not Working**
- Ensure your API key is valid and active
- Check that you've copied it correctly to the `.env` file
- Verify the API key has the necessary permissions

**Data Not Loading**
- Check your internet connection
- Verify the OpenWeatherMap service is operational
- Look at browser console for error messages

**Charts Not Displaying**
- Ensure Chart.js is loaded properly
- Check for JavaScript errors in the console
- Verify the canvas elements exist in the DOM

### Getting Help
If you encounter issues:
1. Check the browser console for errors
2. Verify your `.env` configuration
3. Ensure all dependencies are installed
4. Check the server logs for backend issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🙏 Acknowledgments

- **OpenWeatherMap** for providing the weather and air quality APIs
- **Chart.js** for the beautiful charting library
- **Font Awesome** for the icon set
- **Google Fonts** for the Inter font family
- **Pexels** for the stock images

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.

---

**Made with ❤️ for a cleaner, healthier Bengaluru**