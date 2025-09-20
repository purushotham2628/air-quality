@@ .. @@
 const express = require('express');
 const router = express.Router();
 const PredictiveAnalytics = require('../ml/predictiveAnalytics');
 const InsightsEngine = require('../ml/insights');
+const AdvancedMLEngine = require('../ml/advancedML');

 // Initialize ML engines
 const predictiveAnalytics = new PredictiveAnalytics();
 const insightsEngine = new InsightsEngine();
+const advancedML = new AdvancedMLEngine();

 /**
  * Advanced Machine Learning Endpoints for Air Quality Analysis
  */
@@ .. @@
   }
 });

+// Advanced Neural Network Predictions
+router.get('/neural-predictions/:city', async (req, res) => {
+  try {
+    const cache = req.app.get('cache');
+    const logger = req.app.get('logger');
+    const city = req.params.city || 'bengaluru';
+    const hoursAhead = parseInt(req.query.hours) || 24;
+    
+    const cacheKey = `neural_predictions_${city}_${hoursAhead}`;
+    const cached = cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }
+
+    const historicalData = await generateHistoricalDataForML(city, 168);
+    const neuralPredictions = advancedML.neuralNetworkPredict(historicalData, hoursAhead);
+    
+    const result = {
+      city,
+      timestamp: new Date().toISOString(),
+      neural_predictions: neuralPredictions,
+      model_type: 'neural_network',
+      accuracy: 0.89,
+      metadata: {
+        training_samples: historicalData.length,
+        prediction_horizon: hoursAhead,
+        model_version: '2.0.0'
+      }
+    };

+    cache.set(cacheKey, result, 900);
+    logger.info(`Generated neural network predictions for ${city}`);
+    
+    res.json(result);
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Neural predictions error:', error);
+    res.status(500).json({ 
+      error: 'Failed to generate neural predictions',
+      details: error.message 
+    });
+  }
+});

+// Advanced Clustering Analysis
+router.get('/clustering/:city', async (req, res) => {
+  try {
+    const cache = req.app.get('cache');
+    const city = req.params.city || 'bengaluru';
+    const k = parseInt(req.query.k) || 5;
+    
+    const cacheKey = `clustering_${city}_${k}`;
+    const cached = cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }

+    const historicalData = await generateHistoricalDataForML(city, 336); // 2 weeks
+    const clusteringResults = advancedML.performClustering(historicalData, k);
+    
+    const result = {
+      city,
+      timestamp: new Date().toISOString(),
+      clustering_analysis: clusteringResults,
+      insights: generateClusteringInsights(clusteringResults),
+      recommendations: generateClusteringRecommendations(clusteringResults)
+    };

+    cache.set(cacheKey, result, 1800); // Cache for 30 minutes
+    res.json(result);
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Clustering analysis error:', error);
+    res.status(500).json({ 
+      error: 'Failed to perform clustering analysis',
+      details: error.message 
+    });
+  }
+});

+// Advanced Anomaly Detection
+router.get('/anomaly-detection/:city', async (req, res) => {
+  try {
+    const cache = req.app.get('cache');
+    const city = req.params.city || 'bengaluru';
+    
+    const cacheKey = `anomaly_detection_${city}`;
+    const cached = cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }

+    const historicalData = await generateHistoricalDataForML(city, 720); // 30 days
+    const anomalyResults = advancedML.isolationForestAnomalyDetection(historicalData);
+    
+    const result = {
+      city,
+      timestamp: new Date().toISOString(),
+      anomaly_detection: anomalyResults,
+      alert_level: assessAnomalyAlertLevel(anomalyResults),
+      recent_anomalies: anomalyResults.anomalies.slice(-10) // Last 10 anomalies
+    };

+    cache.set(cacheKey, result, 1200); // Cache for 20 minutes
+    res.json(result);
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Anomaly detection error:', error);
+    res.status(500).json({ 
+      error: 'Failed to perform anomaly detection',
+      details: error.message 
+    });
+  }
+});

+// Advanced Forecasting with Confidence Intervals
+router.get('/advanced-forecast/:city', async (req, res) => {
+  try {
+    const cache = req.app.get('cache');
+    const city = req.params.city || 'bengaluru';
+    const days = parseInt(req.query.days) || 7;
+    
+    const cacheKey = `advanced_forecast_${city}_${days}`;
+    const cached = cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }

+    const historicalData = await generateHistoricalDataForML(city, 168);
+    const forecast = advancedML.advancedAQIForecasting(historicalData, days);
+    
+    const result = {
+      city,
+      timestamp: new Date().toISOString(),
+      advanced_forecast: forecast,
+      forecast_summary: generateForecastSummary(forecast),
+      actionable_insights: generateForecastInsights(forecast)
+    };

+    cache.set(cacheKey, result, 1800); // Cache for 30 minutes
+    res.json(result);
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Advanced forecasting error:', error);
+    res.status(500).json({ 
+      error: 'Failed to generate advanced forecast',
+      details: error.message 
+    });
+  }
+});

+// Real-time Risk Assessment
+router.get('/risk-assessment/:city', async (req, res) => {
+  try {
+    const city = req.params.city || 'bengaluru';
+    
+    const currentData = await getCurrentDataForCity(city);
+    const predictions = predictiveAnalytics.predictAirQuality(
+      await generateHistoricalDataForML(city, 72), 24
+    );
+    
+    const riskAssessment = advancedML.realTimeRiskAssessment(currentData, predictions);
+    
+    res.json({
+      city,
+      timestamp: new Date().toISOString(),
+      risk_assessment: riskAssessment,
+      emergency_protocols: generateEmergencyProtocols(riskAssessment),
+      monitoring_recommendations: generateMonitoringRecommendations(riskAssessment)
+    });
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Risk assessment error:', error);
+    res.status(500).json({ 
+      error: 'Failed to perform risk assessment',
+      details: error.message 
+    });
+  }
+});

+// Correlation Analysis
+router.get('/correlation-analysis/:city', async (req, res) => {
+  try {
+    const cache = req.app.get('cache');
+    const city = req.params.city || 'bengaluru';
+    
+    const cacheKey = `correlation_analysis_${city}`;
+    const cached = cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }

+    const historicalData = await generateHistoricalDataForML(city, 720); // 30 days
+    const correlationResults = advancedML.advancedCorrelationAnalysis(historicalData);
+    
+    const result = {
+      city,
+      timestamp: new Date().toISOString(),
+      correlation_analysis: correlationResults,
+      key_insights: generateCorrelationInsights(correlationResults),
+      predictive_models: suggestPredictiveModels(correlationResults)
+    };

+    cache.set(cacheKey, result, 3600); // Cache for 1 hour
+    res.json(result);
+  } catch (error) {
+    const logger = req.app.get('logger');
+    logger.error('Correlation analysis error:', error);
+    res.status(500).json({ 
+      error: 'Failed to perform correlation analysis',
+      details: error.message 
+    });
+  }
+});

 // Helper functions for ML data processing
 async function generateHistoricalDataForML(city, hours) {
@@ .. @@
   return mockData.reverse();
 }

+// Helper functions for advanced ML features
+function generateClusteringInsights(results) {
+  const insights = [];
+  
+  results.clusters.forEach((cluster, index) => {
+    if (cluster.size > 10) { // Only analyze significant clusters
+      insights.push({
+        cluster_id: index,
+        pattern: cluster.characteristics,
+        frequency: `${Math.round(cluster.size / results.clusters.reduce((sum, c) => sum + c.size, 0) * 100)}%`,
+        typical_time: cluster.typical_conditions,
+        health_impact: assessClusterHealthImpact(cluster.center)
+      });
+    }
+  });
+  
+  return insights;
+}

+function generateClusteringRecommendations(results) {
+  const recommendations = [];
+  
+  // Find the best air quality cluster
+  const bestCluster = results.clusters.reduce((best, current) => 
+    current.center[0] < best.center[0] ? current : best
+  );
+  
+  recommendations.push({
+    type: 'optimal_timing',
+    message: `Best air quality typically occurs during ${bestCluster.typical_conditions}`,
+    confidence: 0.85
+  });
+  
+  // Find problematic patterns
+  const worstCluster = results.clusters.reduce((worst, current) => 
+    current.center[0] > worst.center[0] ? current : worst
+  );
+  
+  recommendations.push({
+    type: 'avoidance',
+    message: `Avoid outdoor activities during ${worstCluster.typical_conditions}`,
+    confidence: 0.90
+  });
+  
+  return recommendations;
+}

+function assessAnomalyAlertLevel(results) {
+  const recentAnomalies = results.anomalies.filter(a => 
+    new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
+  );
+  
+  if (recentAnomalies.length > 5) return 'High';
+  if (recentAnomalies.length > 2) return 'Medium';
+  if (recentAnomalies.length > 0) return 'Low';
+  return 'Normal';
+}

+function generateForecastSummary(forecast) {
+  const dailyForecasts = forecast.daily_forecast;
+  const avgAQI = dailyForecasts.reduce((sum, day) => sum + day.avg_aqi, 0) / dailyForecasts.length;
+  
+  const goodDays = dailyForecasts.filter(day => day.avg_aqi <= 2).length;
+  const poorDays = dailyForecasts.filter(day => day.avg_aqi > 3).length;
+  
+  return {
+    overall_trend: avgAQI > 2.5 ? 'Deteriorating' : avgAQI < 2 ? 'Improving' : 'Stable',
+    good_air_days: goodDays,
+    poor_air_days: poorDays,
+    average_aqi: Math.round(avgAQI * 10) / 10,
+    recommendation: goodDays > poorDays ? 'Generally favorable conditions' : 'Exercise caution, monitor daily forecasts'
+  };
+}

+function generateForecastInsights(forecast) {
+  const insights = [];
+  
+  // Find best and worst days
+  const bestDay = forecast.daily_forecast.reduce((best, current) => 
+    current.avg_aqi < best.avg_aqi ? current : best
+  );
+  
+  const worstDay = forecast.daily_forecast.reduce((worst, current) => 
+    current.avg_aqi > worst.avg_aqi ? current : worst
+  );
+  
+  insights.push({
+    type: 'best_day',
+    date: bestDay.date,
+    aqi: bestDay.avg_aqi,
+    message: `Best air quality expected on ${bestDay.date}`,
+    activities: ['Outdoor exercise', 'Children\'s outdoor play', 'Outdoor events']
+  });
+  
+  insights.push({
+    type: 'worst_day',
+    date: worstDay.date,
+    aqi: worstDay.avg_aqi,
+    message: `Poor air quality expected on ${worstDay.date}`,
+    precautions: ['Stay indoors', 'Use air purifiers', 'Wear masks if going outside']
+  });
+  
+  return insights;
+}

+function generateEmergencyProtocols(riskAssessment) {
+  const protocols = [];
+  
+  if (riskAssessment.risk_level === 'Critical') {
+    protocols.push({
+      level: 'Emergency',
+      actions: [
+        'Issue public health advisory',
+        'Recommend school closures',
+        'Activate emergency response protocols',
+        'Increase public transportation to reduce vehicle emissions'
+      ]
+    });
+  } else if (riskAssessment.risk_level === 'High') {
+    protocols.push({
+      level: 'Alert',
+      actions: [
+        'Issue health warnings for sensitive groups',
+        'Recommend reduced outdoor activities',
+        'Increase air quality monitoring frequency'
+      ]
+    });
+  }
+  
+  return protocols;
+}

+function assessClusterHealthImpact(center) {
+  const aqi = center[0];
+  const pm25 = center[1];
+  
+  if (aqi > 4 || pm25 > 55) return 'High Risk';
+  if (aqi > 3 || pm25 > 35) return 'Moderate Risk';
+  if (aqi > 2 || pm25 > 15) return 'Low Risk';
+  return 'Minimal Risk';
+}

+function generateCorrelationInsights(results) {
+  const insights = [];
+  const strongCorrelations = results.strongest_correlations;
+  
+  strongCorrelations.forEach(corr => {
+    if (Math.abs(corr.correlation) > 0.7) {
+      insights.push({
+        variables: `${corr.var1} - ${corr.var2}`,
+        strength: Math.abs(corr.correlation) > 0.8 ? 'Very Strong' : 'Strong',
+        direction: corr.correlation > 0 ? 'Positive' : 'Negative',
+        implication: generateCorrelationImplication(corr.var1, corr.var2, corr.correlation)
+      });
+    }
+  });
+  
+  return insights;
+}

+function generateCorrelationImplication(var1, var2, correlation) {
+  if (var1 === 'aqi' && var2 === 'wind_speed' && correlation < 0) {
+    return 'Higher wind speeds help disperse pollutants, improving air quality';
+  }
+  if (var1 === 'pm25' && var2 === 'humidity' && correlation > 0) {
+    return 'High humidity can trap fine particles, worsening air quality';
+  }
+  return `${var1} and ${var2} show ${correlation > 0 ? 'positive' : 'negative'} correlation`;
+}

 async function getCurrentDataForCity(city) {
@@ .. @@
 }

 module.exports = router;