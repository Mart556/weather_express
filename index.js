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
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},EE&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
    
        // Check if the response was successful (status code 200)
        if (!response.ok) {
          throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
    
        // Parse the response as JSON
        const data = await response.json();
    
        // Extract and log relevant weather data
        const { main, weather, name } = data;
        console.log(`Weather in`, weather);
        
        const weatherData = {
            city: name,
            temp: main.temp,
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

    if (cityName === '') return;

    const weatherData = await getWeatherData(cityName)
    if (weatherData === undefined) return res.status(500).json({ error: 'Ei saanud ilma infot!' })
        
    res.json(weatherData);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});