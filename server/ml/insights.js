/**
 * Advanced Insights Engine for Air Quality Analytics
 * Generates intelligent insights, alerts, and recommendations
 */

class InsightsEngine {
  constructor() {
    this.alertThresholds = {
      aqi: { moderate: 2, unhealthy: 3, dangerous: 4 },
      pm25: { moderate: 35, unhealthy: 55, dangerous: 150 },
      pm10: { moderate: 100, unhealthy: 250, dangerous: 350 }
    };
    this.insightCache = new Map();
  }

  /**
   * Generate comprehensive air quality insights
   */
  generateInsights(currentData, historicalData, predictions) {
    const insights = {
      current: this.analyzeCurrentConditions(currentData),
      trends: this.analyzeTrends(historicalData),
      forecasting: this.analyzePredictions(predictions),
      alerts: this.generateAlerts(currentData, predictions),
      recommendations: this.generateActionableRecommendations(currentData, predictions),
      comparisons: this.generateComparisons(historicalData),
      healthImpact: this.analyzeHealthImpact(currentData, predictions),
      environmental: this.analyzeEnvironmentalFactors(currentData, historicalData)
    };

    return insights;
  }

  /**
   * Analyze current air quality conditions with advanced metrics
   */
  analyzeCurrentConditions(data) {
    const aqi = data.aqi || data.aqi_indian || 2;
    const pm25 = data.pm25 || 0;
    const pm10 = data.pm10 || 0;

    return {
      overall_status: this.classifyAirQuality(aqi),
      dominant_pollutant: this.identifyDominantPollutant(data),
      health_risk_level: this.calculateHealthRisk(data),
      visibility_impact: this.calculateVisibilityImpact(data),
      activity_recommendations: this.getActivityRecommendations(aqi),
      air_quality_index: {
        value: aqi,
        category: this.getAQICategory(aqi),
        color: this.getAQIColor(aqi),
        description: this.getAQIDescription(aqi)
      },
      pollutant_breakdown: {
        pm25: { value: pm25, status: this.getPollutantStatus(pm25, 'pm25') },
        pm10: { value: pm10, status: this.getPollutantStatus(pm10, 'pm10') },
        no2: { value: data.no2 || 0, status: this.getPollutantStatus(data.no2 || 0, 'no2') },
        o3: { value: data.o3 || 0, status: this.getPollutantStatus(data.o3 || 0, 'o3') }
      }
    };
  }

  /**
   * Advanced trend analysis with pattern recognition
   */
  analyzeTrends(historicalData) {
    if (!historicalData || historicalData.length < 24) {
      return { status: 'insufficient_data', message: 'Need at least 24 hours of data for trend analysis' };
    }

    const recentData = historicalData.slice(-168); // Last 7 days
    const aqiTrend = this.calculateTrend(recentData.map(d => d.aqi || 2));
    const pm25Trend = this.calculateTrend(recentData.map(d => d.pm25 || 0));

    return {
      short_term: {
        direction: aqiTrend.direction,
        strength: aqiTrend.strength,
        change_rate: aqiTrend.changeRate,
        significance: aqiTrend.significance
      },
      weekly_pattern: this.analyzeWeeklyPattern(recentData),
      daily_cycle: this.analyzeDailyCycle(recentData),
      seasonal_indicators: this.analyzeSeasonalIndicators(historicalData),
      improvement_score: this.calculateImprovementScore(historicalData),
      volatility: this.calculateVolatilityMetrics(recentData)
    };
  }

  /**
   * Analyze prediction accuracy and future conditions
   */
  analyzePredictions(predictions) {
    if (!predictions || !predictions.aqi) {
      return { status: 'no_predictions', message: 'No prediction data available' };
    }

    const aqiPredictions = predictions.aqi;
    const upcomingPoor = aqiPredictions.filter(p => p.predicted_aqi >= 3);
    const upcomingGood = aqiPredictions.filter(p => p.predicted_aqi <= 2);

    return {
      outlook: {
        next_6_hours: this.summarizeShortTerm(aqiPredictions.slice(0, 6)),
        next_24_hours: this.summarizeMediumTerm(aqiPredictions.slice(0, 24)),
        confidence: predictions.confidence || 70
      },
      alerts: {
        poor_air_periods: upcomingPoor.map(p => ({
          time: p.timestamp,
          aqi: p.predicted_aqi,
          duration: this.estimateDuration(upcomingPoor, p),
          severity: this.classifyPredictionSeverity(p.predicted_aqi)
        })),
        good_air_windows: upcomingGood.map(p => ({
          time: p.timestamp,
          aqi: p.predicted_aqi,
          optimal_activities: this.suggestOptimalActivities(p.predicted_aqi)
        }))
      },
      patterns: predictions.patterns || {},
      recommendations: predictions.healthRecommendations || []
    };
  }

  /**
   * Generate intelligent alerts based on conditions and predictions
   */
  generateAlerts(currentData, predictions) {
    const alerts = [];
    const currentAQI = currentData.aqi || currentData.aqi_indian || 2;

    // Current condition alerts
    if (currentAQI >= 4) {
      alerts.push({
        type: 'emergency',
        priority: 'critical',
        title: 'Hazardous Air Quality',
        message: 'Air quality is hazardous. Avoid all outdoor activities and stay indoors.',
        actions: ['Close all windows', 'Use air purifiers', 'Avoid outdoor exercise'],
        icon: '🚨',
        color: 'red'
      });
    } else if (currentAQI >= 3) {
      alerts.push({
        type: 'health',
        priority: 'high',
        title: 'Unhealthy Air Quality',
        message: 'Air quality is unhealthy. Sensitive groups should avoid outdoor activities.',
        actions: ['Limit outdoor exposure', 'Wear masks when outside', 'Check on vulnerable family members'],
        icon: '⚠️',
        color: 'orange'
      });
    }

    // Prediction-based alerts
    if (predictions && predictions.aqi) {
      const deterioratingTrend = predictions.aqi.slice(0, 6).filter(p => p.predicted_aqi > currentAQI).length > 3;
      if (deterioratingTrend) {
        alerts.push({
          type: 'forecast',
          priority: 'medium',
          title: 'Air Quality Deteriorating',
          message: 'Air quality is expected to worsen in the next few hours.',
          actions: ['Plan indoor activities', 'Close windows before it gets worse'],
          icon: '📈',
          color: 'yellow'
        });
      }
    }

    // Seasonal/weather-based alerts
    const weatherAlert = this.generateWeatherBasedAlert(currentData);
    if (weatherAlert) alerts.push(weatherAlert);

    return alerts;
  }

  /**
   * Generate actionable recommendations based on advanced analytics
   */
  generateActionableRecommendations(currentData, predictions) {
    const recommendations = [];
    const currentAQI = currentData.aqi || currentData.aqi_indian || 2;

    // Timing recommendations
    if (predictions && predictions.aqi) {
      const bestTimes = this.findOptimalTimes(predictions.aqi);
      if (bestTimes.length > 0) {
        recommendations.push({
          category: 'timing',
          priority: 'high',
          title: 'Best Times for Outdoor Activities',
          items: bestTimes.map(time => `${time.hour}:00 - AQI: ${time.aqi}`),
          explanation: 'Based on air quality predictions for the next 24 hours'
        });
      }
    }

    // Health protection recommendations
    if (currentAQI >= 3) {
      recommendations.push({
        category: 'health',
        priority: 'critical',
        title: 'Health Protection Measures',
        items: [
          'Use N95 or higher grade masks when outdoors',
          'Keep windows and doors closed',
          'Run air purifiers on high setting',
          'Avoid outdoor exercise and strenuous activities',
          'Stay hydrated and avoid alcohol/smoking'
        ],
        explanation: 'Essential steps to protect your health during poor air quality'
      });
    }

    // Activity-specific recommendations
    const activityRecs = this.generateActivityRecommendations(currentData, predictions);
    if (activityRecs.length > 0) {
      recommendations.push({
        category: 'activities',
        priority: 'medium',
        title: 'Activity Recommendations',
        items: activityRecs,
        explanation: 'Recommended activities based on current and predicted air quality'
      });
    }

    return recommendations;
  }

  /**
   * Generate comparative analysis with historical data
   */
  generateComparisons(historicalData) {
    if (!historicalData || historicalData.length < 168) {
      return { status: 'insufficient_data' };
    }

    const thisWeek = historicalData.slice(-168);
    const lastWeek = historicalData.slice(-336, -168);
    const lastMonth = historicalData.slice(-720, -168);

    return {
      vs_last_week: this.compareDataSets(thisWeek, lastWeek, 'week'),
      vs_last_month: this.compareDataSets(thisWeek, lastMonth, 'month'),
      best_day_this_week: this.findBestDay(thisWeek),
      worst_day_this_week: this.findWorstDay(thisWeek),
      improvement_trend: this.calculateImprovementTrend(historicalData),
      percentile_ranking: this.calculatePercentileRanking(historicalData)
    };
  }

  /**
   * Analyze health impact with personalized insights
   */
  analyzeHealthImpact(currentData, predictions) {
    const currentAQI = currentData.aqi || currentData.aqi_indian || 2;
    const pm25 = currentData.pm25 || 0;

    return {
      immediate_risk: this.assessImmediateHealthRisk(currentAQI, pm25),
      sensitive_groups: this.identifySensitiveGroupRisks(currentData),
      long_term_exposure: this.assessLongTermExposure(currentData, predictions),
      protective_measures: this.recommendProtectiveMeasures(currentAQI),
      health_index_score: this.calculateHealthIndexScore(currentData),
      symptoms_to_watch: this.identifyPotentialSymptoms(currentAQI, pm25)
    };
  }

  // Helper methods for advanced calculations
  calculateTrend(values) {
    if (values.length < 5) return { direction: 'stable', strength: 'weak', significance: 'low' };

    const x = values.map((_, i) => i);
    const n = values.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * values[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const changeRate = Math.abs(slope) * 100;

    return {
      direction: slope > 0.05 ? 'improving' : slope < -0.05 ? 'worsening' : 'stable',
      strength: changeRate > 5 ? 'strong' : changeRate > 2 ? 'moderate' : 'weak',
      changeRate: Math.round(changeRate * 100) / 100,
      significance: this.calculateTrendSignificance(values, slope)
    };
  }

  classifyAirQuality(aqi) {
    if (aqi <= 1) return { level: 'excellent', color: '#00E676', message: 'Air quality is excellent' };
    if (aqi <= 2) return { level: 'good', color: '#4CAF50', message: 'Air quality is good' };
    if (aqi <= 3) return { level: 'moderate', color: '#FF9800', message: 'Air quality is moderate' };
    if (aqi <= 4) return { level: 'unhealthy', color: '#F44336', message: 'Air quality is unhealthy' };
    return { level: 'hazardous', color: '#9C27B0', message: 'Air quality is hazardous' };
  }

  getAQICategory(aqi) {
    const categories = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    return categories[Math.min(Math.floor(aqi), categories.length - 1)];
  }

  getAQIColor(aqi) {
    const colors = ['#4CAF50', '#FFEB3B', '#FF9800', '#F44336', '#9C27B0', '#7B1FA2'];
    return colors[Math.min(Math.floor(aqi), colors.length - 1)];
  }

  findOptimalTimes(predictions) {
    return predictions
      .map((p, i) => ({ hour: i + 1, aqi: p.predicted_aqi, timestamp: p.timestamp }))
      .filter(p => p.aqi <= 2)
      .slice(0, 5);
  }

  generateActivityRecommendations(currentData, predictions) {
    const currentAQI = currentData.aqi || 2;
    const activities = [];

    if (currentAQI <= 2) {
      activities.push('Perfect for jogging, cycling, and outdoor sports');
      activities.push('Great time for children to play outside');
      activities.push('Ideal conditions for outdoor photography');
    } else if (currentAQI <= 3) {
      activities.push('Light outdoor activities acceptable');
      activities.push('Consider indoor alternatives for sensitive individuals');
      activities.push('Reduce exercise intensity if outdoors');
    } else {
      activities.push('Stay indoors and avoid outdoor activities');
      activities.push('Use air purifiers and keep windows closed');
      activities.push('Postpone outdoor events and exercise');
    }

    return activities;
  }

  calculateHealthIndexScore(data) {
    const aqi = data.aqi || 2;
    const pm25 = data.pm25 || 0;
    const pm10 = data.pm10 || 0;

    // Weighted health score (lower is better)
    const aqiScore = Math.max(0, (5 - aqi) / 5 * 100);
    const pm25Score = Math.max(0, (150 - pm25) / 150 * 100);
    const pm10Score = Math.max(0, (350 - pm10) / 350 * 100);

    return Math.round((aqiScore * 0.5 + pm25Score * 0.3 + pm10Score * 0.2));
  }

  identifyDominantPollutant(data) {
    const pollutants = {
      'PM2.5': (data.pm25 || 0) / 35, // Normalized to WHO guidelines
      'PM10': (data.pm10 || 0) / 50,
      'NO₂': (data.no2 || 0) / 40,
      'O₃': (data.o3 || 0) / 100
    };

    const dominant = Object.entries(pollutants).reduce((a, b) => 
      pollutants[a[0]] > pollutants[b[0]] ? a : b
    );

    return { name: dominant[0], level: dominant[1], impact: this.describePollutantImpact(dominant[0]) };
  }

  describePollutantImpact(pollutant) {
    const impacts = {
      'PM2.5': 'Fine particles that penetrate deep into lungs and bloodstream',
      'PM10': 'Coarse particles that affect respiratory system',
      'NO₂': 'Gas that irritates airways and reduces lung function',
      'O₃': 'Ground-level ozone that causes breathing difficulties'
    };
    return impacts[pollutant] || 'Unknown pollutant impact';
  }

  calculateTrendSignificance(values, slope) {
    // Simple significance test based on consistency of trend
    const predictions = values.map((_, i) => values[0] + slope * i);
    const errors = values.map((v, i) => Math.abs(v - predictions[i]));
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    
    const errorRatio = avgError / avgValue;
    if (errorRatio < 0.1) return 'high';
    if (errorRatio < 0.2) return 'medium';
    return 'low';
  }

  calculateHealthRisk(data) {
    const aqi = data.aqi || data.aqi_indian || 2;
    const pm25 = data.pm25 || 0;
    const pm10 = data.pm10 || 0;
    const no2 = data.no2 || 0;
    
    // Calculate health risk based on multiple pollutants
    let riskScore = 0;
    
    // AQI contribution (40% weight)
    if (aqi <= 2) riskScore += 0;
    else if (aqi <= 3) riskScore += 20;
    else if (aqi <= 4) riskScore += 60;
    else riskScore += 100;
    
    // PM2.5 contribution (30% weight)
    if (pm25 <= 15) riskScore += 0;
    else if (pm25 <= 35) riskScore += 15;
    else if (pm25 <= 55) riskScore += 45;
    else riskScore += 75;
    
    // PM10 contribution (20% weight)
    if (pm10 <= 50) riskScore += 0;
    else if (pm10 <= 100) riskScore += 10;
    else if (pm10 <= 250) riskScore += 30;
    else riskScore += 50;
    
    // NO2 contribution (10% weight)
    if (no2 <= 20) riskScore += 0;
    else if (no2 <= 40) riskScore += 5;
    else if (no2 <= 80) riskScore += 15;
    else riskScore += 25;
    
    // Normalize to 0-100 scale
    const normalizedScore = Math.min(100, Math.round(riskScore * 0.4));
    
    let level, description, color;
    if (normalizedScore <= 20) {
      level = 'Low';
      description = 'Air quality is satisfactory with little to no health risk';
      color = '#4ade80';
    } else if (normalizedScore <= 40) {
      level = 'Moderate';
      description = 'Acceptable for most people, sensitive individuals may experience minor issues';
      color = '#fbbf24';
    } else if (normalizedScore <= 60) {
      level = 'High';
      description = 'Unhealthy for sensitive groups, others may begin to experience issues';
      color = '#f97316';
    } else if (normalizedScore <= 80) {
      level = 'Very High';
      description = 'Everyone may experience health effects, sensitive groups at serious risk';
      color = '#ef4444';
    } else {
      level = 'Extreme';
      description = 'Emergency conditions, entire population at serious health risk';
      color = '#991b1b';
    }
    
    return {
      score: normalizedScore,
      level,
      description,
      color,
      recommendations: this.getHealthRecommendations(level)
    };
  }

  getHealthRecommendations(riskLevel) {
    const recommendations = {
      'Low': [
        'Great time for outdoor activities',
        'All populations can enjoy normal outdoor exercise',
        'Windows can be left open for natural ventilation'
      ],
      'Moderate': [
        'Most people can continue normal outdoor activities',
        'Sensitive individuals should consider reducing prolonged outdoor exertion',
        'Monitor symptoms if you have respiratory conditions'
      ],
      'High': [
        'Sensitive groups should limit outdoor activities',
        'Everyone else should reduce prolonged outdoor exertion',
        'Consider wearing a mask when outdoors'
      ],
      'Very High': [
        'Everyone should avoid prolonged outdoor activities',
        'Sensitive groups should stay indoors',
        'Use air purifiers and keep windows closed'
      ],
      'Extreme': [
        'Everyone should stay indoors',
        'Avoid all outdoor activities',
        'Seek medical attention if experiencing symptoms'
      ]
    };
    
    return recommendations[riskLevel] || recommendations['Moderate'];
  }
}

module.exports = InsightsEngine;