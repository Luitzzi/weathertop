import {dbClient} from "../config.js";

/* Weather analytics:
    Content:
        - Trends of measurements
        - Min and max values of a specific measurement
 */

// Get trend of measurements
/**
 * Gets the last two measurements in descending order from the database.
 * -> If number measurements > 1:
 *      Calculates the trends of the temperature, wind and airPressure
 *      -> Returns according Bootstrap icons for the pug file
 *      Three possibilities:
 *          - Last measurement data > one before -> icon: arrow up
 *          - Last measurement data = one before -> icon: arrow right
 *          - Last measurement data < one before -> icon: arrow down
 * -> Else: Returns empty strings for the Trend
 * @param {string} station_id
 * @return {Promise<JSON>}
 */
async function getTrend(station_id) {
    const dataOfLastTwoAddedMeasurementsQuery = await dbClient.query("SELECT * FROM measurements WHERE weather_station_id = $1 ORDER BY measurement_id DESC LIMIT 2", [station_id]);
    if (dataOfLastTwoAddedMeasurementsQuery.rows.length > 1) {
        let lastTwoTemperatureData = dataOfLastTwoAddedMeasurementsQuery.rows.map(data => Number(data.temperature));
        let temperatureTrend = getTemperatureTrend(lastTwoTemperatureData);

        let lastTwoWindData = dataOfLastTwoAddedMeasurementsQuery.rows.map(data => Number(data.wind));
        let windTrend = getWindTrend(lastTwoWindData);

        let lastTwoAirPressureData = dataOfLastTwoAddedMeasurementsQuery.rows.map(data => Number(data.air_pressure));
        let airPressureTrend = getAirPressureTrend(lastTwoAirPressureData);

        return {
            ...temperatureTrend,
            ...windTrend,
            ...airPressureTrend
        };
    }
    else {
        return {
            temperatureTrend: "",
            windTrend: "",
            airPressureTrend: "",
        }
    }
}

/**
 * Compares the data of the last and second-last temperature data and returns the according bootstrap icon for the trend
 * @param {number} lastTwoTemperatureData
 * @return {{temperature_trend: string}}
 */
function getTemperatureTrend(lastTwoTemperatureData) {
    const lastTemperature = lastTwoTemperatureData[0];
    const secondLastTemperature = lastTwoTemperatureData[1];
    if (lastTemperature > secondLastTemperature) {
        return  {
            temperature_trend : "bi-arrow-up-right fs-3"
        }
    }
    else if (lastTemperature === secondLastTemperature) {
        return {
            temperature_trend : "bi-arrow-right fs-3"
        }
    }
    else {
        return {
            temperature_trend : "bi-arrow-down-right fs-3"
        }
    }
}

/**
 * Compares the data of the last and second-last wind data and returns the according bootstrap icon for the trend
 * @param {number} lastTwoWindData
 * @return {{wind_trend: string}}
 */
function getWindTrend(lastTwoWindData) {
    const lastWind = lastTwoWindData[0];
    const secondLastWind = lastTwoWindData[1];
    if (lastWind > secondLastWind) {
        return  {
            wind_trend : "bi-arrow-up-right fs-3"
        }
    }
    else if (lastWind === secondLastWind) {
        return {
            wind_trend : "bi-arrow-right fs-3"
        }
    }
    else {
        return {
            wind_trend : "bi-arrow-down-right fs-3"
        }
    }
}

/**
 * Compares the data of the last and second-last airPressure data and returns the according bootstrap icon for the trend
 * @param {[number]} lastTwoAirPressureData
 * @return {{temperatureTrend: string}}
 */
function getAirPressureTrend(lastTwoAirPressureData) {
    const lastAirPressure = lastTwoAirPressureData[0];
    const secondLastAirPressure = lastTwoAirPressureData[1];
    if (lastAirPressure > secondLastAirPressure) {
        return  {
            air_pressure_trend : "bi-arrow-up-right fs-3"
        }
    }
    else if (lastAirPressure === secondLastAirPressure) {
        return {
            air_pressure_trend : "bi-arrow-right fs-3"
        }
    }
    else {
        return {
            air_pressure_trend : "bi-arrow-down-right fs-3"
        }
    }
}

// Get min. and max. values of measurements

/**
 * @param station_id
 * @returns {Promise<{[p: string]: *}>}
 */
async function getMinMaxValues(station_id) {
    let minAndMaxTemperaturesQuery = await getMaxAndMinValuesOfMeasurements(station_id, "temperature");
    let minAndMaxWindQuery = await getMaxAndMinValuesOfMeasurements(station_id, "wind");
    let minAndMaxAirPressureQuery = await getMaxAndMinValuesOfMeasurements(station_id, "air_pressure");

    let minMaxTemperature = minAndMaxTemperaturesQuery.rows[0];
    let minMaxWind = minAndMaxWindQuery.rows[0];
    let minMaxAirPressure = minAndMaxAirPressureQuery.rows[0];
    return {...minMaxTemperature, ...minMaxWind, ...minMaxAirPressure};
}

/**
 * Get the min and max value of a station's measurement data for a specific measurementTyp
 * @param {number} station_id
 * @param {string} measurementTyp (temperature, wind or air_pressure)
 * @returns {Promise<JSON>}
 */
async function getMaxAndMinValuesOfMeasurements(station_id, measurementTyp) {
    const queryString = "select max(measurements." + measurementTyp + ") as highest_" + measurementTyp + "_value, " +
        "min(measurements." + measurementTyp + ") as lowest_" + measurementTyp + "_value " +
        "from measurements " +
        "join weather_stations on measurements.weather_station_id = weather_stations.station_id " +
        "where weather_stations.station_id = $1 " +
        "group by weather_stations.name";
    return await dbClient.query(queryString, [station_id]);
}

export {
    getTrend,
    getMinMaxValues
}