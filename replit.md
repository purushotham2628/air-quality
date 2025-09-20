# Overview

This is a production-ready air quality monitoring dashboard that provides real-time environmental data with advanced machine learning capabilities. The application monitors air quality across 8 major Indian cities, offering predictive analytics, anomaly detection, and personalized health recommendations. It features a premium glass morphism UI with smooth animations and serves as a comprehensive environmental monitoring solution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Vanilla JavaScript Architecture**: Custom-built dashboard using pure JavaScript with modular components
- **Animation System**: GSAP-powered transitions and micro-interactions for premium user experience
- **Chart Visualization**: Chart.js integration for interactive data displays and trend analysis
- **Progressive Web App**: Service worker implementation with offline caching and manifest configuration
- **Glass Morphism Design**: Modern UI with backdrop blur effects, transparent elements, and smooth gradients

## Backend Architecture
- **Express.js Server**: RESTful API structure with modular routing for air quality and ML endpoints
- **Machine Learning Engine**: Custom predictive analytics using time series forecasting and anomaly detection
- **Insights Generation**: Advanced analytics engine for health recommendations and environmental correlation
- **Caching Layer**: Node-cache implementation with 15-minute TTL for ML predictions and API responses
- **Logging System**: Winston-based structured logging with error tracking and performance monitoring

## Data Processing Pipeline
- **Predictive Analytics Module**: Implements Holt-Winters triple exponential smoothing for 24-hour forecasting
- **Pattern Recognition**: Daily, weekly, and seasonal trend analysis with statistical modeling
- **Anomaly Detection**: Real-time identification of pollution spikes using statistical thresholds
- **Health Impact Modeling**: Personalized recommendations based on air quality predictions and user activity

## Security and Performance
- **Helmet.js Security**: Content Security Policy, HSTS, and security headers implementation
- **Compression Middleware**: Gzip compression for optimized response sizes
- **Rate Limiting Ready**: Infrastructure prepared for rate limiting and API throttling
- **Error Handling**: Graceful fallbacks and structured error responses

# External Dependencies

## Third-Party APIs
- **OpenWeatherMap API**: Primary data source for real-time air quality and weather information across 8 Indian cities
- **CDN Services**: Google Fonts for Inter typography, Font Awesome for iconography, and various JavaScript libraries

## Frontend Libraries
- **Chart.js**: Interactive charting library for data visualization and trend displays
- **GSAP (GreenSock)**: Professional animation library for smooth transitions and micro-interactions
- **Lottie Web**: Vector animation rendering for enhanced visual elements
- **Date-fns**: Date manipulation and formatting utilities

## Backend Libraries
- **Express.js**: Web framework for API routing and middleware management
- **Winston**: Advanced logging with structured output and error tracking
- **Helmet**: Security middleware for HTTP headers and content security policies
- **Node-cache**: In-memory caching solution with TTL support (Redis-compatible for scaling)
- **Compression**: Response compression middleware for performance optimization

## Development Tools
- **Nodemon**: Development server with hot reloading capabilities
- **Dotenv**: Environment variable management for API keys and configuration