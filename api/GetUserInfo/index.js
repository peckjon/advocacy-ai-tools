var fetch = require('node-fetch');

module.exports = async function (context, req) {
    // get the access token from the body of the request
    const accessToken = req.body.accessToken;

    // if there is no access token, return an error
    if (!accessToken) {
        context.res = {
            status: 401,
            body: 'The user is not logged in'
        }
    }

    // first, we need to get the id for the video caption track
    const result = await fetch(`https://www.googleapis.com/auth/userinfo.profile?key=${process.env.YOUTUBE_API_KEY}`, {
        headers: {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Accept': 'application/json'
            }
        }
    });

    const data = await result.text();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: data
    };
}