import {API_KEY, app, axios, PORT, session, urlencodedParser} from "./config.js";
import * as UserModels from "./models/user-store.js"
import * as StationModels from "./models/station-store.js"
import * as MeasurementModels from "./models/measurement-store.js"
import {getFormattedTime} from "./utils/weather-formatter.js";

// Middleware
import {getLoggedInUser} from "./utils/middleware.js";

app.use(session({
    secret: "This is a secret!",
    cookie: { maxAge: 3600000 },
    resave: false,
    saveUninitialized: false,
}))

// Constants
export const WEATHER_CODE_OF_EMPTY_STATION = "no measurement";

// Routing

/* Landing page & Login logic
    Consist of:
        - Landing page:
            - Get: "/"
            - Post: "/login"
        - Registration page
            - Get: "/registration"
            - Post "/registration/addUser"
 */

app.get('/', function (request, response) {
    response.render("extends/index", {
        registrationSuccessful: null,
        loginError: null
    });
});

app.post("/login", urlencodedParser, async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    try {
        let isLoginValid = await UserModels.validateLogin(email, password);
        if (isLoginValid) {
            let userIdQuery = await UserModels.getUserId(email);
            request.session.user = {
                user_session_id: userIdQuery.rows[0].user_id
            }
            response.redirect("/dashboard");
        } else {
            response.render("extends/index", {
                loginError: "Falsche E-Mail oder Passwort!"
            });
        }
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/logout", async function(request, response) {
    request.session.destroy(function (err) {})
    response.locals.isLoggedIn = false;
    response.redirect("/");
});

app.get("/registration", function (request, response) {
    response.render("extends/registration", {
        registrationError : null
    });
});

app.post("/registration/addUser", urlencodedParser, async function (request, response) {
    const email = request.body.email;
    const firstName = request.body.first_name;
    const surname = request.body.surname;
    const password = request.body.password;
    const confirmedPassword = request.body.confirmed_password;

    if (password === confirmedPassword) {
        // Try if email isn't in the database -> Has a unique key in the database
        try {
            await UserModels.addUser(email, firstName, surname, password);
            response.render("extends/index", {
                registrationSuccessful: "Registrierung war erfolgreich!"
            });
        } catch (error) {
            if (error.code === "23505") {// 23505 = SQL error code "unique violation"
                response.render("extends/registration", {
                    registrationError: "Die E-Mail ist bereits vergeben! Bitte versuchen Sie es erneut."
                });
            }
            else {
                response.render("extends/error", {
                    error:error
                });
            }
        }
    } else {
        response.render("extends/registration", {
            registrationError: 'Passwörter stimmen nicht überein! Bitte versuchen Sie es erneut.'
        });
    }
});

/* Dashboard site:
    Displays all weather stations with their last added measurement

    HTML methods:
        Get:
            - "/dashboard"
        Post:
            - "/dashboard/add"
            - "/dashboard/delete"
    Features:
        - Add weather station to the database
        - Delete weather station from the database
        - Map displaying all weather stations
        - Link to the measurements of a station -> get request of "/weatherStation/:id"
 */

app.get("/dashboard", getLoggedInUser, async function (request, response){
    const userIdObject = request.session.user;
    const userId = userIdObject.user_session_id;

    try {
        const allStationIdsQuery = await StationModels.getAllStationIds(userId);
        let numberOfStations = allStationIdsQuery.rows.length;
        // Get data of the last added Measurement for each station
        let allStationsData = [];
        for (let i = 0; i < numberOfStations; i++) {
            let station_id = allStationIdsQuery.rows[i].station_id;
            allStationsData.push(await MeasurementModels.getLastAddedMeasurement(station_id));
        }

        response.render("extends/dashboard", {
            isDashboard: true,
            allWeatherStations: allStationsData
        });
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/dashboard/add", urlencodedParser, async function (request, response) {
    const userIdObject = request.session.user;
    const userId = userIdObject.user_session_id;

    const name = request.body.name;
    const degreeOfLatitude = request.body.degree_of_latitude;
    const degreeOfLongitude = request.body.degree_of_longitude;

    try {
        await StationModels.addWeatherStation(name, degreeOfLatitude, degreeOfLongitude, userId);
        response.redirect("/dashboard");
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/dashboard/delete", urlencodedParser, function (request, response) {
    const stationId = request.body.station_id;
    const weatherCode = request.body.weather_code;
    try {
        StationModels.deleteWeatherStation(stationId, weatherCode);
        response.redirect("/dashboard");
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

/* Weather station site
    Weather stations site:
     Displays all measurements of a specific weather station

    HTML methods:
         Get:
             - "/weatherStation/:id"
         Post:
             - "/weatherStation/add"
             - "/weatherStation/delete"
    Features:
         - Add measurement to the database
         - Automatically add a measurement to the database via the API from openweathermap.org (https://openweathermap.org/api)
         - Delete measurement from the database
 */
app.get("/weatherStation/:id", getLoggedInUser, async (request, response) => {
    const userIdObject = request.session.user;
    const userId = userIdObject.user_session_id;
    const station_id = request.params.id;

    try {
        const numberMeasurements = await MeasurementModels.getNumberOfMeasurements(station_id);
        if (numberMeasurements !== "0") {
            const lastAddedMeasurement = await MeasurementModels.getLastAddedMeasurement(station_id);

            const allMeasurementIds = await MeasurementModels.getMeasurementIds(station_id);
            const allMeasurementData = [];
            for (let measurementIdCounter = 0; measurementIdCounter < allMeasurementIds.length; measurementIdCounter++) {
                allMeasurementData.push(await MeasurementModels.getMeasurement(allMeasurementIds[measurementIdCounter]));
            }
            allMeasurementData.reverse(); // To display the last added measurement first

            response.render("extends/weatherstation", {
                isDashboard: false,
                weatherStationInfo: lastAddedMeasurement,
                weatherStationMeasurements: allMeasurementData
            });
        } else {
            let emptyWeatherStation = await StationModels.getEmptyWeatherStation(station_id, userId);
            response.render("extends/weatherstation", {
                isDashboard: false,
                weatherStationInfo: emptyWeatherStation,
                weatherStationMeasurements: {}
            });
        }
    }catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/weatherStation/add", urlencodedParser, async function (request, response) {
    // Parse data from form
    const station_id = request.body.station_id;
    const weather_code = request.body.weather_code;
    const temperature = request.body.temperature;
    const wind = request.body.wind;
    const wind_direction = request.body.wind_direction;
    const air_pressure = request.body.air_pressure;
    const timestamp = getFormattedTime();

    const measurementData = {
        station_id: station_id,
        weather_code: weather_code,
        temperature: temperature,
        wind: wind,
        wind_direction: wind_direction,
        air_pressure: air_pressure,
        timestamp: timestamp
    };

    try {
        MeasurementModels.addMeasurement(measurementData);
        response.redirect("/weatherStation/" + station_id);
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/weatherStation/add/automatic", urlencodedParser, async function(request, response) {
    const station_id = request.body.station_id;
    const stationDataQuery = await StationModels.getStationData(station_id);
    const lat = stationDataQuery.rows[0].degree_of_latitude;
    const lng = stationDataQuery.rows[0].degree_of_longitude;
    const oneCallRequest = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`;

    try {
        let report = {};
        const result = await axios.get(oneCallRequest);
        if (result.status === 200) {
            const reading = result.data;

            // Parse data from the api
            const weather_code = reading.weather[0].id;
            const temperature = reading.main.temp;
            const wind = reading.wind.speed;
            const wind_direction = reading.wind.deg;
            const air_pressure = reading.main.pressure;
            const timestamp = getFormattedTime();

            const measurementData = {
                station_id: station_id,
                weather_code: weather_code,
                temperature: temperature,
                wind: wind,
                wind_direction: wind_direction,
                air_pressure: air_pressure,
                timestamp: timestamp
            };
            MeasurementModels.addMeasurement(measurementData);
            response.redirect("/weatherStation/" + station_id);
        } else {
            console.log("Api adding error");
        }
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.post("/weatherStation/delete", urlencodedParser, async function (request, response) {
    const station_id = request.body.station_id;
    const measurement_id = request.body.measurement_id;
    try {
        MeasurementModels.deleteMeasurement(measurement_id);
        response.redirect("/weatherStation/" + station_id);
    } catch (error) {
        response.render("extends/error", {
            error:error
        });
    }
});

app.listen(PORT, function() {
    console.log(`Weathertop running and listening on port ${PORT}`);
});
