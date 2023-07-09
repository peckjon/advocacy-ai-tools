module.exports = async function (context, req) {
    // get the access token from the query string
    const accessToken = req.query.accessToken;
    const videoId = req.query.videoId;

    // if there is no access token, return an error
    if (!accessToken) {
        context.res = {
            status: 401,
            body: 'You must be logged in to download transcripts'
        }
    }

    // first, we need to get the id for the video caption track
    const result = await fetch(`https://youtube.googleapis.com/youtube/v3/captions?part=id&videoId=${videoId}&key=${YOUTUBE_API_KEY}`, {
        headers: {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Accept': 'application/json'
            }
        }
    });

    const data = await result.json();

    let trackText = "";

    // loop over the tracks
    for (let i = 0; i < data.items.length; i++) {
        // download the track
        const track = data.items[i];
        const trackResult = await fetch(`https://youtube.googleapis.com/youtube/v3/captions/${track.id}?tfmt=srt&key=${API_KEY}`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Accept': 'application/json'
            }
        });

        // convert the track to text
        trackText += await trackResult.text();

    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: response
    };
}