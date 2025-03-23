/**
 * Check if user is logged in -> Continue with get request
 * Else: Display login screen with message "You must be logged in"
 * @param request
 * @param response
 * @param next
 */
function getLoggedInUser(request, response, next) {
    if (request.session.user !== undefined) {
        response.locals.isLoggedIn = true;
        next();
    }
    else {
        response.render("extends/index", {
            loginError: "Sie müssen angemeldet sein!"
        })
    }
}

export {
    getLoggedInUser
} ;