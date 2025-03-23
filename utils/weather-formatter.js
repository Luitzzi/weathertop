/**
 * Format weather data
 * -> Weather_code in text and add icon
 * -> Add temperature icon
 * -> Format wind direction in text and add icon
 * @param {JSON} measurement
 * @returns {* & {weather_text, weather_icon}}
 */
function formatMeasurement(measurement) {
    let weatherInCode = Number(measurement.weather_code);
    let temperature = Number(measurement.temperature);
    let windDirection = Number(measurement.wind_direction);

    let formattedWeatherCode = formatWeatherCode(weatherInCode);
    let temperatureIcon = getTemperatureIcon(temperature);
    let windDirectionIcon = getWindDirectionIcon(windDirection);

    return Object.assign(measurement, formattedWeatherCode, temperatureIcon, windDirectionIcon);
}

/**
 * Format the weather_code into the official weather description
 * @param {number} weatherInCode
 * @returns {{weather_text, weather_icon}}
 */
function formatWeatherCode(weatherInCode) {
    let weather_text;
    let weather_icon;

    if (weatherInCode >= 200 && weatherInCode < 300) {
        weather_text = "Gewitter";
        weather_icon = "bi-cloud-lightning-rain fs-3 text-warning";
    } else if (weatherInCode >= 300 && weatherInCode < 500) {
        weather_text = "Niesel";
        weather_icon = "bi-cloud-drizzle fs-3 text-primary-emphasis";
    } else if (weatherInCode >= 500 && weatherInCode < 600) {
        weather_text = "Regen";
        weather_icon = "bi-cloud-rain-heavy fs-3 text-primary";
    } else if (weatherInCode >= 600 && weatherInCode < 700) {
        weather_text = "Schnee";
        weather_icon = "bi-cloud-snow fs-3";
    } else if (weatherInCode === 701) {
        weather_text = "Dunst";
        weather_icon = "bi-cloud-fog2 fs-3 text-info-emphasis";
    } else if (weatherInCode === 741) {
        weather_text = "Nebel";
        weather_icon = "bi-cloud-fog fs-3 text-info";
    } else if (weatherInCode === 781) {
        weather_text = "Tornado";
        weather_icon = "bi-tornado fs-3 text-danger";
    } else if (weatherInCode === 800) {
        weather_text = "Sonnig";
        weather_icon = "bi-brightness-high fs-3 text-warning";
    } else if (weatherInCode >= 801 && weatherInCode < 900) {
        weather_text = "Bewölkt";
        weather_icon = "bi-clouds fs-3";
    } else {
        weather_text = "Weathercode: " + weatherInCode.toString();
        weather_icon = "bi-code-slash fs-3";
    }

    return {
        weather_text: weather_text,
        weather_icon: weather_icon
    };
}

/**
 * @param {number} temperature
 * @returns {{temperature_icon}}
 */
function getTemperatureIcon(temperature) {
    let temperature_icon;

    if (temperature < 0) {
        temperature_icon = "bi-thermometer-snow fs-3 text-primary";
    } else if (temperature >= 0 && temperature < 10) {
        temperature_icon = "bi-thermometer-low fs-3 text-info";
    } else if (temperature >= 10 && temperature < 20) {
        temperature_icon = "bi-thermometer-half fs-3 text-warning";
    } else if (temperature >= 20 && temperature < 30) {
        temperature_icon = "bi-thermometer-high fs-3 text-warning";
    } else {
        temperature_icon = "bi-thermometer-sun fs-3 text-danger";
    }

    return {
        temperature_icon: temperature_icon
    };
}

/**
 * @param {number} wind_direction
 * @returns {{wind_direction_text, wind_direction_icon}}
 */
function getWindDirectionIcon(wind_direction) {
    let wind_direction_text;
    let wind_direction_icon;

    if ((wind_direction >= 337.5 && wind_direction <= 360) || (wind_direction >= 0 && wind_direction <= 22.5)) {
        wind_direction_text = "Nord";
        wind_direction_icon = "bi-arrow-up-circle fs-4";
    } else if (wind_direction > 22.5 && wind_direction <= 67.5) {
        wind_direction_text = "Nord-Ost";
        wind_direction_icon = "bi-arrow-up-right-circle fs-4";
    } else if (wind_direction > 67.5 && wind_direction <= 112.5) {
        wind_direction_text = "Ost";
        wind_direction_icon = "bi-arrow-right-circle fs-4";
    } else if (wind_direction > 112.5 && wind_direction <= 157.5) {
        wind_direction_text = "Süd-Ost";
        wind_direction_icon = "bi-arrow-down-right-circle fs-4";
    } else if (wind_direction > 157.5 && wind_direction <= 202.5) {
        wind_direction_text = "Süd";
        wind_direction_icon = "bi-arrow-down-circle fs-4";
    } else if (wind_direction > 202.5 && wind_direction <= 247.5) {
        wind_direction_text = "Süd-West";
        wind_direction_icon = "bi-arrow-down-left-circle fs-4";
    } else if (wind_direction > 247.5 && wind_direction <= 292.5) {
        wind_direction_text = "West";
        wind_direction_icon = "bi-arrow-left-circle fs-4";
    } else if (wind_direction > 292.5 && wind_direction <= 337.5) {
        wind_direction_text = "Nord-west";
        wind_direction_icon = "bi-arrow-up-left-circle fs-4";
    } else {
        wind_direction_text = "Windrichtung unbekannt";
        wind_direction_icon = "bi-question-circle fs-4";
    }

    return {
        wind_direction_text: wind_direction_text,
        wind_direction_icon: wind_direction_icon
    }
}

/**
 * Create a formatted timestamp for the current date in the form: "hour:minutes Uhr, am day.month.year
 * @return {string}
 */
function getFormattedTime() {
    const currentDate = new Date();
    function addLeadingZeroToDate(number) {
        return number < 10 ? `0${number}` : number;
    }
    return `${addLeadingZeroToDate(currentDate.getHours())}:${addLeadingZeroToDate(currentDate.getMinutes())} Uhr, am ${addLeadingZeroToDate(currentDate.getDate())}.${addLeadingZeroToDate(currentDate.getMonth() + 1)}.${currentDate.getFullYear()}`;
}

export {
    formatMeasurement,
    getFormattedTime,
}