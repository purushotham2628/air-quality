/**
 * Premium UI Controller with Advanced Animations and ML Integration
 * Implements smooth transitions, interactive elements, and real-time updates
 */

class PremiumUI {
  constructor() {
    this.animationTimeline = gsap.timeline();
    this.lottieAnimations = new Map();
    this.particleSystem = null;
    this.mlInsights = null;
    this.realTimeUpdater = null;
    this.init();
  }

  /**
   * Initialize premium UI components
   */
  init() {
    this.setupAdvancedAnimations();
    this.initializeParticleSystem();
    this.setupRealtimeUpdates();
    this.initializeMLDashboard();
    this.setupInteractiveElements();
    this.startBackgroundAnimations();
  }

  /**
   * Setup advanced GSAP animations with smooth transitions
   */
  setupAdvancedAnimations() {
    // Smooth page load animation
    gsap.set('.dashboard-container', { opacity: 0, scale: 0.95 });
    gsap.set('.condition-card', { y: 50, opacity: 0 });
    gsap.set('.chart-card', { x: 30, opacity: 0 });

    // Stagger animation for cards
    gsap.to('.dashboard-container', {
      duration: 0.8,
      opacity: 1,
      scale: 1,
      ease: 'power2.out'
    });

    gsap.to('.condition-card', {
      duration: 0.6,
      y: 0,
      opacity: 1,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      delay: 0.3
    });

    gsap.to('.chart-card', {
      duration: 0.7,
      x: 0,
      opacity: 1,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.6
    });

    // Floating animation for AQI badge
    gsap.to('#aqi-badge', {
      duration: 3,
      y: -10,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    // Pulse animation for alerts
    gsap.set('.alert-pulse', { scale: 1 });
    gsap.to('.alert-pulse', {
      duration: 1.5,
      scale: 1.05,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }

  /**
   * Initialize particle system for ambient effects
   */
  initializeParticleSystem() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.1;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.3 + 0.1;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76, 175, 80, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  /**
   * Setup real-time updates with smooth transitions
   */
  setupRealtimeUpdates() {
    this.realTimeUpdater = setInterval(() => {
      this.updateDataWithAnimation();
    }, 300000); // Update every 5 minutes

    // Immediate update
    this.updateDataWithAnimation();
  }

  /**
   * Update data with smooth animations
   */
  async updateDataWithAnimation() {
    try {
      // Get current city
      const currentCity = document.getElementById('city-selector').value;
      
      // Fetch ML insights and predictions
      const [airQuality, weather, predictions, insights] = await Promise.all([
        this.fetchAirQuality(currentCity),
        this.fetchWeather(currentCity),
        this.fetchMLPredictions(currentCity),
        this.fetchMLInsights(currentCity)
      ]);

      // Animate data updates
      this.animateAQIUpdate(airQuality);
      this.animateWeatherUpdate(weather);
      this.updateMLInsights(insights);
      this.updatePredictionCharts(predictions);
      
      // Update timestamp with fade effect
      gsap.to('#last-updated-time', {
        duration: 0.3,
        opacity: 0,
        onComplete: () => {
          document.getElementById('last-updated-time').textContent = 
            new Date().toLocaleTimeString();
          gsap.to('#last-updated-time', { duration: 0.3, opacity: 1 });
        }
      });

    } catch (error) {
      console.error('Failed to update data:', error);
      this.showErrorNotification('Failed to update data. Retrying...');
    }
  }

  /**
   * Animate AQI value updates
   */
  animateAQIUpdate(data) {
    const aqiValue = document.getElementById('aqi-value');
    const aqiStatus = document.getElementById('aqi-status');
    const aqiBadge = document.getElementById('aqi-badge');
    
    // Smooth number transition
    const currentValue = parseInt(aqiValue.textContent) || 0;
    const targetValue = data.aqi_indian || data.aqi * 50;
    
    gsap.to({ value: currentValue }, {
      duration: 1.5,
      value: targetValue,
      ease: 'power2.out',
      onUpdate: function() {
        aqiValue.textContent = Math.round(this.targets()[0].value);
      }
    });

    // Status update with color transition
    const statusColor = this.getAQIColor(data.aqi || 2);
    gsap.to(aqiBadge, {
      duration: 0.8,
      backgroundColor: statusColor,
      ease: 'power2.inOut'
    });

    // Update pollutant bars with staggered animation
    this.updatePollutantBars(data);
  }

  /**
   * Update pollutant progress bars with animation
   */
  updatePollutantBars(data) {
    const pollutants = ['pm25', 'pm10', 'no2', 'o3'];
    
    pollutants.forEach((pollutant, index) => {
      const valueElement = document.getElementById(`${pollutant}-value`);
      const progressElement = document.getElementById(`${pollutant}-progress`);
      
      if (valueElement && progressElement) {
        const value = data[pollutant] || 0;
        const percentage = this.calculatePollutantPercentage(pollutant, value);
        
        // Update value with animation
        gsap.to(valueElement, {
          duration: 0.5,
          opacity: 0,
          delay: index * 0.1,
          onComplete: () => {
            valueElement.textContent = value.toFixed(1);
            gsap.to(valueElement, { duration: 0.5, opacity: 1 });
          }
        });

        // Animate progress bar
        gsap.to(progressElement, {
          duration: 1.2,
          width: `${percentage}%`,
          ease: 'power3.out',
          delay: index * 0.15
        });
      }
    });
  }

  /**
   * Initialize ML-powered dashboard
   */
  async initializeMLDashboard() {
    // Create ML insights panel
    const mlPanel = this.createMLPanel();
    document.querySelector('.dashboard-main').appendChild(mlPanel);

    // Initialize prediction charts
    this.initializePredictionCharts();
    
    // Setup anomaly detection display
    this.setupAnomalyDetection();
    
    // Initialize health recommendations
    this.initializeHealthRecommendations();
  }

  /**
   * Create ML insights panel
   */
  createMLPanel() {
    const panel = document.createElement('section');
    panel.className = 'ml-insights-section';
    panel.innerHTML = `
      <div class="ml-panel">
        <div class="panel-header">
          <h3><i class="fas fa-brain"></i> AI-Powered Insights</h3>
          <div class="confidence-indicator">
            <span class="confidence-label">Confidence:</span>
            <div class="confidence-bar">
              <div class="confidence-fill" id="confidence-fill"></div>
            </div>
            <span class="confidence-value" id="confidence-value">--</span>
          </div>
        </div>
        
        <div class="insights-grid">
          <div class="insight-card prediction-card">
            <h4>📈 Predictions</h4>
            <div id="prediction-summary">Loading predictions...</div>
            <canvas id="prediction-mini-chart"></canvas>
          </div>
          
          <div class="insight-card pattern-card">
            <h4>🔍 Pattern Analysis</h4>
            <div id="pattern-insights">Analyzing patterns...</div>
          </div>
          
          <div class="insight-card anomaly-card">
            <h4>⚠️ Anomaly Detection</h4>
            <div id="anomaly-alerts">No anomalies detected</div>
          </div>
          
          <div class="insight-card recommendation-card">
            <h4>💡 Smart Recommendations</h4>
            <div id="ml-recommendations">Generating recommendations...</div>
          </div>
        </div>

        <div class="advanced-metrics">
          <div class="metric-item">
            <span class="metric-label">Air Quality Trend</span>
            <div class="trend-indicator" id="trend-indicator">
              <i class="fas fa-arrow-right"></i>
              <span id="trend-text">Stable</span>
            </div>
          </div>
          
          <div class="metric-item">
            <span class="metric-label">Health Impact Score</span>
            <div class="health-score" id="health-score">75/100</div>
          </div>
          
          <div class="metric-item">
            <span class="metric-label">Prediction Accuracy</span>
            <div class="accuracy-score" id="accuracy-score">87%</div>
          </div>
        </div>
      </div>
    `;

    return panel;
  }

  /**
   * Setup interactive elements with hover effects
   */
  setupInteractiveElements() {
    // Card hover effects
    document.querySelectorAll('.condition-card, .chart-card, .insight-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          duration: 0.3,
          y: -5,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          duration: 0.3,
          y: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          ease: 'power2.out'
        });
      });
    });

    // Button interactions with ripple effect
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(e.target, e);
      });
    });

    // City selector with smooth transitions
    const citySelector = document.getElementById('city-selector');
    citySelector.addEventListener('change', (e) => {
      this.animateCityTransition(e.target.value);
    });
  }

  /**
   * Create ripple effect for button clicks
   */
  createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      transform: scale(0);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    gsap.to(ripple, {
      duration: 0.6,
      scale: 2,
      opacity: 0,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  }

  /**
   * Start background animations
   */
  startBackgroundAnimations() {
    // Subtle background gradient animation
    gsap.to('body', {
      duration: 20,
      backgroundPosition: '200% 200%',
      repeat: -1,
      ease: 'none'
    });

    // Floating icon animations
    gsap.to('.fas', {
      duration: 4,
      rotation: 360,
      repeat: -1,
      ease: 'none',
      stagger: {
        each: 0.5,
        from: 'random'
      }
    });
  }

  /**
   * Fetch ML predictions from API
   */
  async fetchMLPredictions(city) {
    try {
      const response = await fetch(`/api/ml/predictions/${city}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ML predictions:', error);
      return null;
    }
  }

  /**
   * Fetch ML insights from API
   */
  async fetchMLInsights(city) {
    try {
      const response = await fetch(`/api/ml/insights/${city}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch ML insights:', error);
      return null;
    }
  }

  /**
   * Update ML insights display
   */
  updateMLInsights(insights) {
    if (!insights || !insights.insights) return;

    const { current, trends, forecasting, alerts } = insights.insights;

    // Update confidence indicator
    const confidence = forecasting?.outlook?.confidence || 70;
    gsap.to('#confidence-fill', {
      duration: 1.5,
      width: `${confidence}%`,
      ease: 'power2.out'
    });
    document.getElementById('confidence-value').textContent = `${confidence}%`;

    // Update trend indicator
    if (trends?.short_term) {
      const trendElement = document.getElementById('trend-indicator');
      const trendText = document.getElementById('trend-text');
      
      trendText.textContent = trends.short_term.direction === 'improving' ? 'Improving' :
                             trends.short_term.direction === 'worsening' ? 'Worsening' : 'Stable';
      
      const color = trends.short_term.direction === 'improving' ? '#4CAF50' :
                   trends.short_term.direction === 'worsening' ? '#F44336' : '#FF9800';
      
      gsap.to(trendElement, {
        duration: 0.5,
        color: color,
        ease: 'power2.out'
      });
    }

    // Update health impact score
    if (current?.health_risk_level) {
      const healthScore = document.getElementById('health-score');
      gsap.to(healthScore, {
        duration: 0.3,
        opacity: 0,
        onComplete: () => {
          healthScore.textContent = `${current.health_risk_level}/100`;
          gsap.to(healthScore, { duration: 0.3, opacity: 1 });
        }
      });
    }
  }

  /**
   * Helper methods
   */
  getAQIColor(aqi) {
    if (aqi <= 1) return '#4CAF50';
    if (aqi <= 2) return '#8BC34A';
    if (aqi <= 3) return '#FF9800';
    if (aqi <= 4) return '#F44336';
    return '#9C27B0';
  }

  calculatePollutantPercentage(pollutant, value) {
    const maxValues = {
      pm25: 150,
      pm10: 350,
      no2: 100,
      o3: 200
    };
    return Math.min(100, (value / maxValues[pollutant]) * 100);
  }

  showErrorNotification(message) {
    // Create and show error notification with animation
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    gsap.fromTo(notification, 
      { opacity: 0, y: -50 },
      { 
        duration: 0.5, 
        opacity: 1, 
        y: 0,
        onComplete: () => {
          setTimeout(() => {
            gsap.to(notification, {
              duration: 0.5,
              opacity: 0,
              y: -50,
              onComplete: () => notification.remove()
            });
          }, 3000);
        }
      }
    );
  }

  // Additional methods for air quality and weather fetching would be here...
  async fetchAirQuality(city) {
    try {
      const response = await fetch(`/api/air-quality?city=${city}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch air quality:', error);
      return { aqi: 2, aqi_indian: 100, pm25: 25, pm10: 45, no2: 15, o3: 60 };
    }
  }

  async fetchWeather(city) {
    try {
      const response = await fetch(`/api/weather?city=${city}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      return { temperature: 25, humidity: 65, wind_speed: 3.2 };
    }
  }
}

// Initialize premium UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.premiumUI = new PremiumUI();
});