// Declaration of node.js modules:
import express from "express"; // Web dev framework
import session from "express-session"; // Session handler
import pg from "pg"; // Database control
import bodyParser from "body-parser"; // Parse forms -> Send with post-method to the server
import { urlencoded } from "express";
import pug from "pug"; // Template Engine
import dotenv from "dotenv";
import axios from "axios"; // For api requests

// Set environment variables
dotenv.config();
const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;
const CON_STRING = process.env.DB_CON_STRING; // Login data for DBeaver
if (CON_STRING === undefined) {
    console.log("Error: Environment variable not set!");
    process.exit(1);
}

// Configure database server - DBeaver
pg.defaults.ssl = true; // Activate encrypted data transmission
const dbConfig = {
    connectionString: CON_STRING,
    ssl: {rejectUnauthorized: false},
}
const dbClient = new pg.Client(dbConfig);
dbClient.connect(); // Connect to the database

// Configure parser
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

let app = express(); //Starts app

// Configure api requests - Axios
//const oneCallRequest = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`;

// General settings
    // Static content
    app.use(express.static("public"));
    // Configure template engine
    app.set("views", "views");
    app.set("view engine", "pug");


export {
    express,
    session,
    axios,
    app,
    pg,
    bodyParser,
    urlencoded,
    pug,
    dotenv,
    PORT,
    CON_STRING,
    API_KEY,
    dbClient,
    urlencodedParser
};