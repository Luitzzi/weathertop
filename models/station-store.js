import {dbClient} from "../config.js";
import {WEATHER_CODE_OF_EMPTY_STATION} from "../app.js";

/* Querys to the weatherstations table
    Content:
        -  Get information about a station
        -  Manipulate weatherstations table
 */

// Get information about a station
/**
 * Get the station data - name, degree_of_latitude, degree_of_longitude
 * @param {number} station_id
 * @returns {Promise<JSON>}
 */
async function getStationData(station_id) {
    try {
        return await dbClient.query("SELECT * FROM weather_stations WHERE station_id = $1", [station_id]);
    } catch (error) {
        throw error;
    }
}

/**
 * @param {number} user_id
 * @returns {Promise<JSON>}
 */
async function getAllStationIds(user_id){
    try {
        return await dbClient.query("SELECT station_id FROM weather_stations WHERE owner_id = $1", [user_id]);
    } catch (error) {
        throw error;
    }
}

/**
 * Create an object with zero-initialized measurement data and just the name/longitude/latitude of the weather station
 * -> Needed to display just added weather stations on the dashboard or on the measurements site
 * @param {number} station_id
 * @param {number }user_id
 * @returns {array} noContentWeatherStation (object)
 */
async function getEmptyWeatherStation(station_id, user_id) {
    const stationDataQuery = await getStationData(station_id);
    let name = stationDataQuery.rows[0].name;
    let degree_of_latitude = stationDataQuery.rows[0].degree_of_latitude;
    let degree_of_longitude = stationDataQuery.rows[0].degree_of_longitude;

    return {
        "weather_station_id": station_id,
        "weather_code": WEATHER_CODE_OF_EMPTY_STATION,
        "weather_text": WEATHER_CODE_OF_EMPTY_STATION,
        "temperature": "-",
        "wind": "-",
        "wind_direction": "0",
        "air_pressure": "-",
        "measurement_id": "0",
        "timestamp": "",
        "station_id": station_id,
        "owner_id": user_id,
        "name": name,
        "degree_of_latitude": degree_of_latitude,
        "degree_of_longitude": degree_of_longitude,
        "highest_temperature_value": "-",
        "lowest_temperature_value": "-",
        "highest_wind_value": "-",
        "lowest_wind_value": "-",
        "highest_air_pressure_value": "-",
        "lowest_air_pressure_value": "-"
    };
}

// Manipulate weatherstations table

/**
 * @param {string} name
 * @param {number} degreeOfLatitude
 * @param {number} degreeOfLongitude
 * @param {number} userId
 */
async function addWeatherStation(name, degreeOfLatitude, degreeOfLongitude, userId) {
    let queryString = "INSERT INTO weather_stations " +
        "(name, degree_of_latitude, degree_of_longitude, owner_id) " +
        "VALUES($1, $2, $3, $4)";
    try {
        dbClient.query(queryString, [name, degreeOfLatitude, degreeOfLongitude, userId]);
    } catch(error) {
        throw error;
    }
}

/**
 * @param {string} stationId
 * @param {number} weatherCode
 * @returns {Promise<void>}
 */
async function deleteWeatherStation(stationId, weatherCode) {
    try {
        if (weatherCode === WEATHER_CODE_OF_EMPTY_STATION) {
            dbClient.query("DELETE FROM weather_stations WHERE station_id = $1", [stationId]);
        }
        else {
            // Delete all measurements of clicked weather station
            dbClient.query("DELETE FROM measurements USING weather_stations WHERE measurements.weather_station_id = weather_stations.station_id AND weather_stations.station_id = $1", [stationId]);
            // Delete the weather station
            dbClient.query("DELETE FROM weather_stations WHERE station_id = $1", [stationId]);
            }
    } catch (error) {
        console.log(error);
    }
}

export {
    getStationData,
    getAllStationIds,
    getEmptyWeatherStation,

    addWeatherStation,
    deleteWeatherStation,
}