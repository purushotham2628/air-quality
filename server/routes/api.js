const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const API_KEY = process.env.API_KEY;
const LAT = 12.9716;
const LON = 77.5946;

router.get('/air-quality', async (req, res) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const info = data.list[0].components;
    const aqi = data.list[0].main.aqi;

    res.json({ aqi, pm2_5: info.pm2_5, pm10: info.pm10 });
  } catch (err) {
    res.status(500).json({ error: "API fetch failed" });
  }
});

module.exports = router;
