module.exports = async function (context, req) {
  // get the access token from the query string
  const videoIdOrUrl = req.body.videoIdOrUrl;
  const accessToken = req.body.accessToken;

  // if there is no access token, return an error
  if (!accessToken) {
    context.res = {
      status: 401,
      body: "You must be logged in to download transcripts",
    };
  }

  try {
    // use a regular express to get the id from the videoIdorUrl parameter. The id may be the entire string, or it may be the value of the v parameter in a YouTube URL or it may be the last part of the path on a shortened YouTube URL.
    let videoId =
      videoIdOrUrl.match(/v=([^&]+)/) ||
      videoIdOrUrl.match(/youtu.be\/([^&]+)/) ||
      videoIdOrUrl;
    if (typeof videoId === "object") {
      videoId = videoId[1];
    }

    if (!videoId) {
      return (context.res = {
        status: 500,
        body: "That does not appear to be a valid YouTube video ID or URL.",
      });
    }

    // first, we need to get the id for the video caption track
    const result = await fetch(
      `https://youtube.googleapis.com/youtube/v3/captions?part=id&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
      {
        headers: {
          headers: {
            Authorization: "Bearer " + accessToken,
            Accept: "application/json",
          },
        },
      }
    );

    const data = await result.json();

    // if the response is a 401, return a message the user is not logged in
    if (data.error) {
      context.res = {
        status: 401,
        body: "You must be logged in to download transcripts",
      };
    }

    let trackText = "";

    // loop over the tracks
    for (let i = 0; i < data.items.length; i++) {
      // download the track
      const track = data.items[i];
      const trackResult = await fetch(
        `https://youtube.googleapis.com/youtube/v3/captions/${track.id}?tfmt=srt&key=${process.env.YOUTUBE_API_KEY}`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
            Accept: "application/json",
          },
        }
      );

      if (trackResult.status === 401) {
        return (context.res = {
          status: 401,
          body: "You must be logged in to download transcripts",
        });
      }

      // convert the track to text
      trackText += await trackResult.text();
    }

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: trackText,
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: error.message,
    };
  }
};
