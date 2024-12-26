const form = document.getElementById('weather-form');
const locationInput = document.getElementById('location');
const weatherDisplay = document.querySelector('.weather-display');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const weatherDescription = document.getElementById('weather-description');
const conditionIcon = document.getElementById('condition-icon');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const city = locationInput.value.trim();
    
    if (city) {
        displayWeather(city);
    }
});

function displayWeather(city) {
    // Simulate data for testing purposes
    const simulatedData = {
        cityName: city || "New York",
        temperature: 22,
        humidity: 75,
        windSpeed: 15,
        description: "Partly Cloudy",
        icon: "images/partly-cloudy.png" // Replace with actual paths
    };
    
    // Display the simulated data
    weatherDisplay.classList.remove('hidden');
    cityName.textContent = simulatedData.cityName;
    temperature.textContent = `Temperature: ${simulatedData.temperature}°C`;
    humidity.textContent = `Humidity: ${simulatedData.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${simulatedData.windSpeed} km/h`;
    weatherDescription.textContent = `Condition: ${simulatedData.description}`;
    conditionIcon.src = simulatedData.icon;
    
    errorMessage.classList.add('hidden');
}
