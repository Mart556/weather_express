const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'node_modules')));

require('dotenv').config();
const apiKey = process.env.WEATHER_API_KEY;

async function getWeatherData(cityName) {
    cityName = cityName.toLowerCase()

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName},EE&appid=${apiKey}&units=metric`);
    
        if (!response.ok) {
          throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        const { main, weather, name } = data;
        
        const weatherData = {
            city: name,
            temp: Number(main.temp).toFixed(0),
            type: weather[0].main,
            icon: weather[0].icon
        }
        
        return weatherData
    } catch (error) {
        console.error('Error:', error.message);
    }
};

app.get('/', async (req, res) => {
    const weatherData = await getWeatherData('Tartu')
    console.log(weatherData)
    res.render('index', {weatherData});
});

app.get('/requestWeather', async (req, res) => {
    const cityName = req.query.city;

    if (cityName === '') return res.status(500).json({ error: 'Linna nimi ei saa olla tyhi!' });

    const weatherData = await getWeatherData(cityName)
    if (weatherData === undefined) return res.status(500).json({ error: 'Ei saanud ilma infot!' })

    res.json(weatherData);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});