import {dbClient} from "../config.js";
import * as StationModels from "./station-store.js";
import {formatMeasurement} from "../utils/weather-formatter.js";
import {getTrend, getMinMaxValues} from "../utils/weather-analytics.js";

/* Querys to the measurements table
    Content:
        - Get information about a measurement
        - Manipulate the measurements table
 */

// Get information about a measurement

/**
 * @param {number} station_id
 * @returns {Promise<number>}
 */
async function getNumberOfMeasurements(station_id) {
    try {
        const numberQuery = await dbClient.query("SELECT count(measurement_id) AS measurement_count FROM measurements WHERE weather_station_id = $1", [station_id]);
        return numberQuery.rows[0].measurement_count;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {number} station_id
 * @returns {number} measurement_id
 */
async function getLastAddedMeasurementId(station_id) {
    try {
        const lastAddedMeasurementIdQuery = await dbClient.query("SELECT measurement_id FROM measurements WHERE weather_station_id = $1 ORDER BY measurement_id DESC LIMIT 1", [station_id]);
        return lastAddedMeasurementIdQuery.rows[0].measurement_id;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {number} station_id
 * @returns {Promise<[JSON]>}
 */
async function getLastAddedMeasurement(station_id) {
    try {
        if (await getNumberOfMeasurements(station_id) > 0) {
            let lastAddedMeasurementId = await getLastAddedMeasurementId(station_id);
            let lastMeasurement = await getMeasurement(lastAddedMeasurementId);

            let stationDataQuery = await StationModels.getStationData(station_id);
            let stationData = stationDataQuery.rows[0];

            let minMaxValues = await getMinMaxValues(station_id);
            let allTrends = await getTrend(station_id);
            return {...lastMeasurement, ...stationData, ...minMaxValues, ...allTrends};

        } else {
            return await StationModels.getEmptyWeatherStation(station_id);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * @param {number} station_id
 * @returns {Promise<[number]>}
 */
async function getMeasurementIds(station_id) {
    try {
        const allMeasurementsQuery = await dbClient.query("SELECT measurement_id FROM measurements WHERE weather_station_id = $1", [station_id]);
        const numberMeasurements = allMeasurementsQuery.rows.length;

        let measurementIds = new Array(numberMeasurements);
        for (let measurementCounter = 0; measurementCounter < numberMeasurements; measurementCounter++) {
            measurementIds[measurementCounter] = allMeasurementsQuery.rows[measurementCounter].measurement_id;
        }
        return measurementIds;
    } catch (error) {
        throw error;
    }
}

/**
 * @param {number} measurement_id
 * @returns {Promise<JSON>}
 */
async function getMeasurement(measurement_id) {
    try {
        const uneditedMeasurementQuery = await dbClient.query("SELECT * FROM measurements WHERE measurement_id = $1", [measurement_id]);
        return formatMeasurement(uneditedMeasurementQuery.rows[0]);
    } catch (error) {
        throw error;
    }
}

// Manipulate measurements table:

/**
 * @param {JSON} measurementData
 */
function addMeasurement(measurementData) {
    const station_id = measurementData.station_id;
    const weather_code = measurementData.weather_code;
    const temperature = measurementData.temperature;
    const wind = measurementData.wind;
    const wind_direction = measurementData.wind_direction;
    const air_pressure = measurementData.air_pressure;
    const timestamp = measurementData.timestamp;

    const queryString = "INSERT INTO measurements " +
        "(weather_station_id, weather_code, temperature, wind, wind_direction, air_pressure, timestamp) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7)";
    try {
        dbClient.query(queryString, [station_id, weather_code, temperature, wind, wind_direction, air_pressure, timestamp]);
    } catch(error) {
        throw error;
    }
}

/**
 * @param {number} measurement_id
 */
function deleteMeasurement(measurement_id) {
    try {
        dbClient.query("DELETE FROM measurements WHERE measurement_id = $1", [measurement_id]);
    } catch (error) {
        throw error;
    }
}

export {
    getNumberOfMeasurements,
    getLastAddedMeasurementId,
    getLastAddedMeasurement,
    getMeasurementIds,
    getMeasurement,

    addMeasurement,
    deleteMeasurement
}