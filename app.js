// Your API Keys
const weatherApiKey = "87dc683f0b5d42b08acb93abad79ac12"; // OpenWeather API key
const mapboxToken = "pk.eyJ1IjoiY3J1c3RjcnVzYWRlciIsImEiOiJjbTU2OW9yOXYzZ2IzMmtwa3RneXlwcmQxIn0.M8al-KguxJD-V_zJiuPltA"; // Mapbox API key

// DOM Elements
const form = document.querySelector("#weather-form");
const input = document.querySelector("#location");
const weatherDisplay = document.querySelector(".weather-display");
const errorMessage = document.querySelector("#error-message");
const radarMap = document.querySelector("#radar-map");
const layerSelect = document.querySelector("#layer-select");

// Weather layer configuration with specific settings for each type
const weatherLayers = {
    temp_new: {
        name: "Temperature",
        opacity: 0.6,
        legend: true,
        colorScale: [
            { temp: -20, color: '#91cfff' },
            { temp: 0, color: '#b3d9ff' },
            { temp: 20, color: '#ffd699' },
            { temp: 40, color: '#ff8c66' }
        ]
    },
    precipitation_new: {
        name: "Precipitation",
        opacity: 0.5,
        legend: true,
        colorScale: [
            { value: 0, color: 'rgb(32, 31, 31)' },
            { value: 1, color: '#99ffff' },
            { value: 10, color: '#337acc' },
            { value: 50, color: '#0000ff' }
        ]
    },
    clouds_new: {
        name: "Clouds",
        opacity: 0.5,
        legend: true,
        colorScale: [
            { value: 0, color: 'rgba(0, 0, 0, 0.98)' },
            { value: 25, color: 'rgb(0, 0, 0)' },
            { value: 50, color: 'rgb(20, 0, 0)' },
            { value: 100, color: 'rgb(37, 2, 2)' }
        ]
    },
    wind_new: {
        name: "Wind Speed",
        opacity: 0.5,
        legend: true,
        colorScale: [
            { speed: 0, color: 'rgba(0,255,0,0.3)' },
            { speed: 10, color: 'rgba(255,255,0,0.5)' },
            { speed: 20, color: 'rgba(255,165,0,0.7)' },
            { speed: 30, color: 'rgba(255,0,0,0.8)' }
        ]
    },
    pressure_new: {
        name: "Pressure",
        opacity: 0.5,
        legend: true,
        colorScale: [
            { pressure: 950, color: '#8c66ff' },
            { pressure: 1000, color: '#b3b3ff' },
            { pressure: 1050, color: '#ffcc99' }
        ]
    }
};

// Initialize layer select dropdown
function initializeLayerSelect() {
    layerSelect.innerHTML = Object.entries(weatherLayers)
        .map(([value, layer]) => `<option value="${value}">${layer.name}</option>`)
        .join('');
}

// Form Submission Event Listener
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = input.value.trim();
    const selectedLayer = layerSelect.value;

    if (city) {
        fetchWeatherData(city, selectedLayer);
    }
});

// Fetch weather data from OpenWeatherMap API
async function fetchWeatherData(city, selectedLayer) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${weatherApiKey}`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
            const { lat, lon } = data.coord;
            displayRadarMap(lat, lon, selectedLayer);
        } else {
            throw new Error(data.message || "Error fetching weather data.");
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
    }
}

// Display the weather data in the DOM
function displayWeather(data) {
    const cityName = data.name;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const weatherDescription = data.weather[0].description;
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    document.getElementById("city-name").textContent = cityName;
    document.getElementById("temperature").textContent = `Temperature: ${temp}°`;
    document.getElementById("humidity").textContent = `Humidity: ${humidity}%`;
    document.getElementById("wind-speed").textContent = `Wind Speed: ${windSpeed} m/s`;
    document.getElementById("weather-description").textContent = `Condition: ${weatherDescription}`;
    document.getElementById("condition-icon").src = weatherIcon;

    weatherDisplay.classList.remove("hidden");
    errorMessage.classList.add("hidden");
}

// Create or update the legend
function createLegend(map, layerType) {
    // Remove existing legend if any
    const existingLegend = document.getElementById('map-legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    const layer = weatherLayers[layerType];
    if (!layer.legend) return;

    const legend = document.createElement('div');
    legend.id = 'map-legend';
    legend.style.position = 'absolute';
    legend.style.bottom = '25px';
    legend.style.right = '10px';
    legend.style.background = 'white';
    legend.style.padding = '10px';
    legend.style.borderRadius = '5px';
    legend.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    legend.style.color = 'black'; // Added to ensure all text in legend is black

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.style.color = 'black'; // Added to ensure title is black
    title.textContent = layer.name;
    legend.appendChild(title);

    layer.colorScale.forEach(item => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.margin = '2px 0';

        const colorBox = document.createElement('div');
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = item.color;
        colorBox.style.marginRight = '5px';

        const label = document.createElement('span');
        label.style.color = 'black'; // Added to ensure label text is black
        const value = item.temp || item.value || item.speed || item.pressure;
        const unit = layerType === 'temp_new' ? '°C' : 
                    layerType === 'wind_new' ? 'm/s' : 
                    layerType === 'pressure_new' ? 'hPa' : '';
        label.textContent = `${value}${unit}`;

        row.appendChild(colorBox);
        row.appendChild(label);
        legend.appendChild(row);
    });

    map.getContainer().appendChild(legend);
}

// Display the radar map with selected weather layer
function displayRadarMap(lat, lon, selectedLayer) {
    mapboxgl.accessToken = mapboxToken;

    // Initialize or get existing map
    let map = window.weatherMap;
    if (!map) {
        map = new mapboxgl.Map({
            container: "radar-map",
            style: "mapbox://styles/mapbox/dark-v10", // Dark style for better weather visualization
            center: [lon, lat],
            zoom: 7,
        });
        window.weatherMap = map;
    } else {
        map.setCenter([lon, lat]);
    }

    map.on("load", () => {
        // Remove existing layers if present
        if (map.getLayer("weather-layer")) {
            map.removeLayer("weather-layer");
        }
        if (map.getSource("weather")) {
            map.removeSource("weather");
        }

        // Build the URL for the selected weather layer
        const weatherLayer = weatherLayers[selectedLayer];
        const tileUrl = `https://tile.openweathermap.org/map/${selectedLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`;

        // Add new weather layer
        map.addSource("weather", {
            type: "raster",
            tiles: [tileUrl],
            tileSize: 256,
            attribution: '© OpenWeatherMap'
        });

        map.addLayer({
            id: "weather-layer",
            type: "raster",
            source: "weather",
            paint: {
                "raster-opacity": weatherLayer.opacity,
                "raster-opacity-transition": {
                    duration: 300
                }
            }
        });

        // Create or update the legend
        createLegend(map, selectedLayer);
    });

    // Add layer controls
    layerSelect.onchange = (e) => {
        const newLayer = e.target.value;
        const newUrl = `https://tile.openweathermap.org/map/${newLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`;
        
        if (map.getSource("weather")) {
            map.getSource("weather").setTiles([newUrl]);
            // Update the layer opacity
            map.setPaintProperty("weather-layer", "raster-opacity", weatherLayers[newLayer].opacity);
            // Update the legend
            createLegend(map, newLayer);
        }
    };
}

// Initialize the application
initializeLayerSelect();