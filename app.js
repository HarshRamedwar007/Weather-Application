// Global Variables for Weather Application
const inputLocation = document.querySelector('main .location-input');
const searchButton = document.querySelector('main .location-search');
const trackButton = document.querySelector('main .track-location');
const cityNotFound = document.querySelector('main .no-city-entered');
const weatherSection = document.querySelector('.main-weather-section');
const weatherIcon = document.querySelector('.main-weather-section .location-weather-image');
const locationNameDisplay = document.querySelector('.main-weather-section .location-name');
const locationTempDisplay = document.querySelector('.main-weather-section .location-temp');
const locationDateTime = document.querySelector('.main-weather-section .location-date-time');
const weatherTypeDisplay = document.querySelector('.main-weather-section .location-weather-description');
const weatherDetailsContainer = document.querySelector('.other-weather-section');
const detailsHeading = document.querySelector('.other-weather-details-section-heading');
const forecastHeading = document.querySelector('.extended-forecast-heading');
const forecastContainer = document.querySelector('.extended-forecast-container');
const recentSearchContainer = document.querySelector('.recent-search-dropdown-container');
const recentSearchList = document.querySelector('.recent-search-dropdown');
const recentSearchTitle = document.querySelector('.recent-search-heading');

// API Key and Base URLs for Weather and Geolocation APIs
const WEATHER_API_KEY = "8ZLS6YDNME24NJG9R37MG7RU2";
const WEATHER_API_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
const GEOLOCATION_API_BASE_URL = "https://geocode.maps.co/reverse?";
const GEOLOCATION_API_KEY = "668cd66d4bc6b339749963owr35b6b3";

const endpoints = {
    getByLocation: (location) => `${WEATHER_API_BASE_URL}${location}/?unitGroup=metric&include=days&key=${WEATHER_API_KEY}&contentType=json`,
    getByCoordinates: (lat, lon) => `${WEATHER_API_BASE_URL}${lat},${lon}?unitGroup=metric&include=days&key=${WEATHER_API_KEY}&contentType=json`,
    getLocationFromCoords: (lat, lon) => `${GEOLOCATION_API_BASE_URL}lat=${lat}&lon=${lon}&api_key=${GEOLOCATION_API_KEY}`
}

const previousSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];


// Weather icons for different weather types
const weatherIcons = {
    sunny: "./resources/sunnysky.png",
    cloud: "./resources/cloudysky.png",
    rain: "./resources/rainysky.png",
    snow: "./resources/snowsky.png",
    clear: "./resources/clearsky.png",
    wind: "./resources/windsky.png",
    fog: "./resources/fogsky.png"
};


// Function to display the main weather details on the scree
function displayMainWeather(weatherData, location) {
    let { address: cityName } = weatherData;
    const { icon, temp, datetime: date, description } = weatherData?.days[0];
    let weatherIconURL = null;
    cityName = location ? location : cityName;

    // Reveal Weather Elements
    weatherSection.style.display = "block";

    Object.keys(weatherIcons).forEach(type => {
        if (icon.includes(type)) weatherIconURL = weatherIcons[type];
    });

    // Update UI with weather data
    weatherIcon.src = weatherIconURL;
    weatherIcon.title = icon;
    locationNameDisplay.textContent = cityName.toUpperCase();
    locationTempDisplay.textContent = temp + " °C";
    locationDateTime.textContent = date;
    weatherTypeDisplay.textContent = description;
}

// Function to remove all child elements of a given container (e.g., weather details)

function clearPreviousDetails(container) {
    Array.from(container.children).forEach(child => child.remove());
}

function displayOtherWeatherDetails(weatherData) {
    clearPreviousDetails(weatherDetailsContainer);

    const { dew, humidity, precip, windspeed, uvindex, visibility } = weatherData?.days[0];
    const weatherInfo = { dew, humidity, precip, windspeed, uvindex, visibility };

    Object.keys(weatherInfo).forEach(key => {
        const infoBlock = document.createElement('article');
        const infoTitle = document.createElement('h3');
        const infoValue = document.createElement("p");

        infoBlock.className = "bg-white w-[140px] h-[120px] text-center p-3 rounded-xl shadow-xl";
        infoTitle.className = "font-semibold text-xl";
        infoValue.className = "mt-3 text-lg";

        // Set the title and value of each weather detail
        infoTitle.textContent = key.toUpperCase();
        infoValue.textContent = weatherInfo[key];

        if (key === "dew") infoValue.textContent += " °C";
        else if (key === "precip") infoValue.textContent += " mm";
        else if (key === "humidity") infoValue.textContent += " %";
        else if (key === "windspeed") infoValue.textContent += " mph";
        else if (key === "visibility") infoValue.textContent += " km";

        infoBlock.append(infoTitle, infoValue);
        weatherDetailsContainer.appendChild(infoBlock);
    });
}


// Function to get the day of the week from a day index (0 = Sunday, 6 = Saturday)
function getDayName(dayIndex) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[dayIndex];
}

function updateExtendedForecast(weatherData) {
    clearPreviousDetails(forecastContainer);

    weatherData?.days?.slice(1, 6).forEach(day => {
        const { datetime: date, icon, temp, humidity, windspeed } = day;

        const forecastBlock = document.createElement('article');
        const forecastDay = document.createElement('h3');
        const forecastIcon = document.createElement('img');
        const tempInfo = document.createElement("p");
        const humidityInfo = document.createElement("p");
        const windInfo = document.createElement("p");

          // Set the weather details for each day
        forecastBlock.className = "bg-white text-center p-3 rounded-xl shadow-lg";
        forecastIcon.className = "w-36 mx-auto my-5";
        forecastDay.className = "font-bold text-lg";

        forecastDay.textContent = date;
        tempInfo.textContent = `Temp: ${temp} °C`;
        humidityInfo.textContent = `Humidity: ${humidity} %`;
        windInfo.textContent = `Wind: ${windspeed} mph`;

        forecastBlock.title = icon;
        Object.keys(weatherIcons).forEach(type => {
            if (icon.includes(type)) {
                forecastIcon.src = weatherIcons[type];
            }
        });


        // Append the new elements to the extended forecast container
        forecastBlock.append(forecastDay, forecastIcon, tempInfo, humidityInfo, windInfo);
        forecastContainer.appendChild(forecastBlock);
    });
}

function addRecentSearch(location, forceAdd = false) {
    if (!forceAdd && previousSearches.length && previousSearches.includes(location.toLowerCase())) return;

    if (recentSearchList.children.length === 10) {
        recentSearchList.lastChild.remove();
    }


    // Create a new dropdown option for the recent search
    const option = document.createElement("p");
    option.className = "location-option cursor-pointer py-2 px-2 hover:bg-slate-200";
    option.textContent = location.charAt(0).toUpperCase() + location.slice(1);
    recentSearchList.insertBefore(option, recentSearchList.firstChild);

    if (!forceAdd) {
        previousSearches.push(location.toLowerCase());
        localStorage.setItem('recentSearches', JSON.stringify(previousSearches));
    }
}

function showMessage(message, color) {
    const popup = document.createElement('div');
    const messageText = document.createElement('p');

    messageText.textContent = message;
    popup.className = `bg-white py-2 px-3 rounded-lg shadow-lg border-2 ${color === 'red' ? 'border-red-600 text-red-600' : 'border-green-600 text-green-600'} absolute right-5 top-5`;

    popup.appendChild(messageText);
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}


// Function to validate that the user has entered a location
function validateLocationInput(location) {
    if (!location) {
        showMessage("Please Enter a Location!", "red");
        return false;
    }
    return true;
}

async function fetchWeather(e, location = null, lat = null, lon = null, tracedName = null, trackLocation = false) {
    const locationInputValue = location || inputLocation.value;

    if (!trackLocation && !validateLocationInput(locationInputValue.trim().toLowerCase())) return;

    try {
        inputLocation.value = "";

        let response = null;
        if (!lat) {
            response = await fetch(endpoints.getByLocation(locationInputValue));
        } else {
            response = await fetch(endpoints.getByCoordinates(lat, lon));
        }

        const weatherData = await response.json();


        // Update the UI with fetched weather data
        cityNotFound.style.display = "none";
        detailsHeading.style.display = "block";
        forecastHeading.style.display = "block";

        tracedName ? displayMainWeather(weatherData, tracedName) : displayMainWeather(weatherData);
        displayOtherWeatherDetails(weatherData);
        updateExtendedForecast(weatherData);

        recentSearchContainer.style.display = "block";
        if (!trackLocation) addRecentSearch(locationInputValue);
    } catch (error) {
        showMessage(error.toString().includes("invalid JSON") ? "Invalid Location!" : "Network Error!", "red");
    }
}

function handleSearchFromDropdown(e) {
    const target = e.target;
    if (target.classList.contains("location-option")) {
        const selectedLocation = target.textContent;
        fetchWeather(null, selectedLocation);
    }
}


// Initialize by displaying the most recent search and populating the recent search dropdown
if (previousSearches.length) {
    previousSearches.reverse().forEach((location, index) => {
        if (index === 0) fetchWeather(null, location);
        addRecentSearch(location, true);
    });
}

function trackUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchLocationFromCoords, handleLocationError, { enableHighAccuracy: true });
    }
}

async function fetchLocationFromCoords(positions) {
    const lat = positions.coords.latitude;
    const lon = positions.coords.longitude;
    const locationName = await getLocationFromCoords(lat, lon);
    fetchWeather(null, locationName, lat, lon, locationName, true);
}

async function getLocationFromCoords(lat, lon) {
    const res = await fetch(endpoints.getLocationFromCoords(lat, lon));
    const resData = await res.json();
    return `${resData?.address?.city}, ${resData?.address?.state}`;
}


// Function to handle location fetching errors
function handleLocationError(error) {
    showMessage("Please enable location in your settings!", "red");
}


// Add event listeners for button clicks
searchButton.addEventListener('click', fetchWeather);
recentSearchList.addEventListener('click', handleSearchFromDropdown);
trackButton.addEventListener('click', trackUserLocation);
