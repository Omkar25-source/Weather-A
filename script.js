// 1. SELECT DOM ELEMENTS
// We grab references to our HTML elements using their IDs so we can change them later.
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

// State Containers (Loading, Error, Main Content)
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const weatherContent = document.getElementById('weatherContent');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');

// Weather Data Elements
const cityName = document.getElementById('cityName');
const weatherDesc = document.getElementById('weatherDesc');
const currentTemp = document.getElementById('currentTemp');
const highLowTemp = document.getElementById('highLowTemp');
const weatherIcon = document.getElementById('weatherIcon');
const humidityVal = document.getElementById('humidityVal');
const aqiVal = document.getElementById('aqiVal');
const aqiBadge = document.getElementById('aqiBadge');
const uvVal = document.getElementById('uvVal');
const uvBadge = document.getElementById('uvBadge');

// Health Alert Elements
const healthAlertContainer = document.getElementById('healthAlertContainer');
const healthAlert = document.getElementById('healthAlert');
const alertIcon = document.getElementById('alertIcon');
const alertHeading = document.getElementById('alertHeading');
const alertText = document.getElementById('alertText');

// 2. FETCH WEATHER DATA (AJAX)
// This function talks to our Flask backend API using the Fetch API
async function fetchWeather(city) {
    showLoadingState();

    try {
        // We use the exact backend URL (localhost:5000) so that VS Code Live Server (running on 5500) can find it!
        const response = await fetch(`http://localhost:5000/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('City not found or server error.');
        }

        const data = await response.json();
        updateUI(data);

    } catch (error) {
        console.error("Error fetching weather:", error);
        showErrorState("Could not connect to the backend. Make sure to run 'python app.py' in your terminal!");
    }
}

// 3. UPDATE DOM WITH DATA
function updateUI(data) {
    // Hide loading/error, show actual weather data
    showWeatherState();

    // DOM Manipulation: Updating text inside elements
    cityName.textContent = data.location;
    weatherDesc.textContent = data.description;
    currentTemp.innerHTML = `${data.temperature}&deg;`;
    highLowTemp.innerHTML = `H: ${data.high}&deg; &nbsp;&bull;&nbsp; L: ${data.low}&deg;`;
    humidityVal.textContent = `${data.humidity}%`;
    
    // Update AQI
    aqiVal.textContent = data.aqi;
    updateAQIBadge(data.aqi);

    // Update UV
    uvVal.textContent = data.uv;
    updateUVBadge(data.uv);

    // Change Weather Icon dynamically
    updateWeatherIcon(data.description);

    // Toggle Health Alert based on alerts array returned from the python backend!
    updateHealthAlert(data.alerts);
}

// 4. EVENT LISTENERS
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

retryBtn.addEventListener('click', () => {
    fetchWeather(cityInput.value.trim() || 'Mumbai, India');
});

// 5. HELPER FUNCTIONS FOR DOM MANIPULATION
function showLoadingState() {
    loadingState.classList.remove('d-none');
    errorState.classList.add('d-none');
    weatherContent.classList.add('d-none');
    healthAlertContainer.classList.add('d-none');
}

function showErrorState(message) {
    loadingState.classList.add('d-none');
    errorState.classList.remove('d-none');
    weatherContent.classList.add('d-none');
    healthAlertContainer.classList.add('d-none');
    if (message) errorText.textContent = message;
}

function showWeatherState() {
    loadingState.classList.add('d-none');
    errorState.classList.add('d-none');
    weatherContent.classList.remove('d-none');
}

// Helper to style AQI Badge
function updateAQIBadge(aqi) {
    aqiBadge.className = 'badge rounded-pill px-2 py-1 ms-2 fs-7 align-middle ';
    if (aqi <= 50) {
        aqiBadge.classList.add('bg-success', 'text-white');
        aqiBadge.textContent = 'Good';
    } else if (aqi <= 100) {
        aqiBadge.classList.add('bg-warning', 'text-dark');
        aqiBadge.textContent = 'Mod';
    } else {
        aqiBadge.classList.add('bg-danger', 'text-white');
        aqiBadge.textContent = 'Poor';
    }
}

// Helper to style UV Badge
function updateUVBadge(uv) {
    uvBadge.className = 'badge rounded-pill px-2 py-1 ms-2 fs-7 align-middle ';
    if (uv <= 2) {
        uvBadge.classList.add('bg-success', 'text-white');
        uvBadge.textContent = 'Low';
    } else if (uv <= 5) {
        uvBadge.classList.add('bg-warning', 'text-dark');
        uvBadge.textContent = 'Mod';
    } else {
        uvBadge.classList.add('bg-danger', 'text-white');
        uvBadge.textContent = 'High';
    }
}

// Map description to bootstrap icon
function updateWeatherIcon(desc) {
    const text = desc.toLowerCase();
    weatherIcon.className = 'text-primary weather-icon me-3 bi ';
    if (text.includes('rain') || text.includes('shower')) {
        weatherIcon.classList.add('bi-cloud-rain-heavy-fill');
    } else if (text.includes('clear') || text.includes('sunny')) {
        weatherIcon.classList.add('bi-sun-fill', 'text-warning');
        weatherIcon.classList.remove('text-primary');
    } else if (text.includes('haze') || text.includes('fog')) {
        weatherIcon.classList.add('bi-cloud-haze-fill', 'text-secondary');
        weatherIcon.classList.remove('text-primary');
    } else {
        weatherIcon.classList.add('bi-cloud-sun');
    }
}

// Display Health Warning Logic processing arrays from Python API
function updateHealthAlert(alerts) {
    // Basic structural classes
    healthAlert.className = 'alert health-alert d-flex align-items-center p-3 mb-0 ';
    
    // Check if the python API gave us any alerts at all
    if (alerts && alerts.length > 0) {
        // Show the container
        healthAlertContainer.classList.remove('d-none');
        alertHeading.textContent = 'Health Suggestions';
        
        // Let's decide how bad it is. If someone needs to avoid going outside, mark it RED!
        const isSevere = alerts.some(al => al.includes("Avoid"));

        if (isSevere) {
            healthAlert.classList.add('alert-danger'); 
            healthAlert.style.backgroundColor = 'rgba(254, 226, 226, 0.85)';
            healthAlert.style.borderColor = 'rgba(248, 113, 113, 0.8)';
            alertIcon.className = 'fs-4 me-3 bi bi-exclamation-octagon-fill text-danger';
        } else {
            healthAlert.style.backgroundColor = 'rgba(254, 252, 232, 0.85)';
            healthAlert.style.borderColor = 'rgba(253, 230, 138, 0.8)';
            alertIcon.className = 'fs-4 me-3 bi bi-brightness-high-fill text-warning';
        }

        // Join the array into HTML segments separated by breaks
        alertText.innerHTML = alerts.join('<br>&bull; ');
        
        // adding a leading bullet to make it a nice list
        alertText.innerHTML = '&bull; ' + alertText.innerHTML;

    } else {
        // No alerts from Python = Hide container
        healthAlertContainer.classList.add('d-none');
    }
}

// Initialize on page load (Fetch default city)
window.addEventListener('DOMContentLoaded', () => {
    fetchWeather(cityInput.value);
});
