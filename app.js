const weatherApiKey = "87dc683f0b5d42b08acb93abad79ac12";
const mapboxToken = "pk.eyJ1IjoiY3J1c3RjcnVzYWRlciIsImEiOiJjbTU2OW9yOXYzZ2IzMmtwa3RneXlwcmQxIn0.M8al-KguxJD-V_zJiuPltA";
const DEFAULT_CITY = "Washington, DC";

let currentMapState = {
    center: [0, 0],
    zoom: 2
};


const form = document.querySelector("#weather-form");
const input = document.querySelector("#location");
const weatherDisplay = document.querySelector(".weather-display");
const errorMessage = document.querySelector("#error-message");
const radarMap = document.querySelector("#radar-map");
const layerSelect = document.querySelector("#layer-select");

const fahrenheitLayers = {
    temp_new: {
        name: "Temperature",
        opacity: 0.6,
        legend: true,
        unit: "°F",
        colorScale: [
            { value: -4, color: '#91cfff' },
            { value: 32, color: '#b3d9ff' },
            { value: 68, color: '#ffd699' },
            { value: 104, color: '#ff8c66' }
        ]
    }
};

const celsiusLayers = {
    temp_new: {
        name: "Temperature",
        opacity: 0.6,
        legend: true,
        unit: "°C",
        colorScale: [
            { value: -20, color: '#91cfff' },
            { value: 0, color: '#b3d9ff' },
            { value: 20, color: '#ffd699' },
            { value: 40, color: '#ff8c66' }
        ]
    }
};

const weatherLayers = {
    temp_new: {
        name: "Temperature",
        opacity: 0.6,
        legend: true,
        unit: "°F",
        colorScale: [
            { value: -4, color: '#91cfff' },
            { value: 32, color: '#b3d9ff' },
            { value: 68, color: '#ffd699' },
            { value: 104, color: '#ff8c66' }
        ]
    },
    precipitation_new: {
        name: "Precipitation",
        opacity: 0.5,
        legend: true,
        unit: "mm",
        colorScale: [
            { value: 1, color: '#99ffff' },
            { value: 10, color: '#337acc' },
            { value: 50, color: '#0000ff' }
        ]
    },
    clouds_new: {
        name: "Clouds",
        opacity: 0.5,
        legend: true,
        unit: "%",
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
        unit: "mph",
        colorScale: [
            { value: 0, color: 'rgba(0,255,0,0.3)' },
            { value: 22, color: 'rgba(255,255,0,0.5)' },
            { value: 45, color: 'rgba(255,165,0,0.7)' },
            { value: 67, color: 'rgba(255,0,0,0.8)' }
        ]
    },
    pressure_new: {
        name: "Pressure",
        opacity: 0.5,
        legend: true,
        unit: "hPa",
        colorScale: [
            { value: 950, color: '#8c66ff' },
            { value: 1000, color: '#b3b3ff' },
            { value: 1050, color: '#ffcc99' }
        ]
    }
};

function updateTemperatureLayer() {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    if (unit === 'metric') {
        weatherLayers.temp_new = celsiusLayers.temp_new;
    } else {
        weatherLayers.temp_new = fahrenheitLayers.temp_new;
    }
    
    if (window.weatherMap && layerSelect.value === 'temp_new') {
        updateMapLayer('temp_new');
    }
}

// Add event listener for unit change
document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', updateTemperatureLayer);
});

function initializeLayerSelect() {
    layerSelect.innerHTML = Object.entries(weatherLayers)
        .map(([value, layer]) => `<option value="${value}">${layer.name}</option>`)
        .join('');
}

initializeLayerSelect();

layerSelect.addEventListener('change', (event) => {
    const selectedLayer = event.target.value;
    if (window.weatherMap) {
        currentMapState = {
            center: window.weatherMap.getCenter(),
            zoom: window.weatherMap.getZoom()
        };
        updateMapLayer(selectedLayer);
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = input.value.trim();
    const selectedLayer = layerSelect.value;

    if (city) {
        fetchWeatherData(city, selectedLayer);
    }
});

async function fetchWeatherData(city, selectedLayer) {
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${weatherApiKey}`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data, unit);
            const { lat, lon } = data.coord;
            
            if (window.weatherMap) {
                window.weatherMap.setCenter([lon, lat]);
                currentMapState.center = [lon, lat];
                updateMapLayer(selectedLayer);
            } else {
                initializeMap(lat, lon, selectedLayer);
            }
        } else {
            throw new Error(data.message || "Error fetching weather data.");
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove("hidden");
        weatherDisplay.classList.add("hidden");
    }
}

function displayWeather(data, unit) {
    const cityName = data.name;
    const temp = data.main.temp !== undefined ? data.main.temp : 0;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed !== undefined ? data.wind.speed : 0;
    const weatherDescription = data.weather[0].description;
    const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const tempUnit = unit === 'imperial' ? '°F' : '°C';
    const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

    document.getElementById("city-name").textContent = cityName;
    document.getElementById("temperature").textContent = `Temperature: ${temp.toFixed(1)}${tempUnit}`;
    document.getElementById("humidity").textContent = `Humidity: ${humidity}%`;
    document.getElementById("wind-speed").textContent = `Wind Speed: ${windSpeed.toFixed(1)} ${windUnit}`;
    document.getElementById("weather-description").textContent = `Condition: ${weatherDescription}`;
    document.getElementById("condition-icon").src = weatherIcon;

    weatherDisplay.classList.remove("hidden");
    errorMessage.classList.add("hidden");
}

function createLegend(map, layerType) {
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
    legend.style.color = 'black';

    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.style.color = 'black';
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
        label.style.color = 'black';
        label.textContent = `${item.value}${layer.unit}`;

        row.appendChild(colorBox);
        row.appendChild(label);
        legend.appendChild(row);
    });

    map.getContainer().appendChild(legend);
}

function updateMapLayer(selectedLayer) {
    const map = window.weatherMap;
    if (!map || !map.loaded()) return;

    const tileUrl = `https://tile.openweathermap.org/map/${selectedLayer}/{z}/{x}/{y}.png?appid=${weatherApiKey}`;

    if (map.getSource('weather')) {
        map.getSource('weather').setTiles([tileUrl]);
    } else {
        map.addSource('weather', {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256
        });

        map.addLayer({
            id: 'weather-layer',
            type: 'raster',
            source: 'weather',
            paint: {
                'raster-opacity': weatherLayers[selectedLayer].opacity
            }
        });
    }

    map.setPaintProperty('weather-layer', 'raster-opacity', weatherLayers[selectedLayer].opacity);
    createLegend(map, selectedLayer);
    map.setCenter(currentMapState.center);
    map.setZoom(currentMapState.zoom);
}

function initializeMap(lat, lon, selectedLayer) {
    mapboxgl.accessToken = mapboxToken;

    if (!window.weatherMap) {
        window.weatherMap = new mapboxgl.Map({
            container: 'radar-map',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [lon, lat],
            zoom: 7
        });

        window.weatherMap.on('load', () => {
            currentMapState = {
                center: [lon, lat],
                zoom: 7
            };
            updateMapLayer(selectedLayer);
        });

        window.weatherMap.on('moveend', () => {
            currentMapState = {
                center: window.weatherMap.getCenter(),
                zoom: window.weatherMap.getZoom()
            };
        });
    }
}