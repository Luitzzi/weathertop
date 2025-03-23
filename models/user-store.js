import {dbClient} from "../config.js";

/* Querys to the users table
    Content:
        - Get information from the users table
        - Manipulate the users table
 */

// Get information from the users table

/**
 * @param {string} email
 * @returns {Promise<JSON>}
 */
async function getUserId(email) {
    try {
        return await dbClient.query("SELECT * FROM users WHERE email = $1", [email]);
    } catch (error) {
        throw error;
    }
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function validateLogin(email, password) {
    try {
        let result = await dbClient.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
        return result.rows.length !== 0;
    } catch (error) {
        throw (error);
    }
}

// Manipulate the users table

/**
 * @param {string} email (Unique key)(Unique key)
 * @param {string} first_name
 * @param {string} surname
 * @param {string} password
 * @returns {Promise<void>}
 */
async function addUser(email, first_name, surname, password) {
    try {
        await dbClient.query("INSERT INTO users (email,first_name,surname,password) VALUES($1,$2,$3,$4)",
            [email, first_name, surname, password]);
    } catch (error) {
        throw (error);
    }
}



export {
    addUser,
    validateLogin,
    getUserId,
}