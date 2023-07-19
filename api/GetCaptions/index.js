var { getSubtitles } = require("youtube-caption-extractor");
var fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    // parse the id off the body
    const { videoUrl } = req.body;

    const videoId = videoUrl.split("v=")[1] || videoUrl.split("/").pop();

    const videoCaptions = await getSubtitles({ videoID: videoId, lang: "en" });

    let formattedCaptions = "";

    videoCaptions.forEach((caption) => {
      // round the seconds to the nearest second
      caption.start = Math.round(caption.start);

      const formattedTime = formatTime(caption.start);

      const formattedStart = formatTime(caption.start);
      formattedCaptions += `Timestamp: ${formattedTime}, Caption: ${caption.text}\n\n`;
    });

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: { captions: formattedCaptions },
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: error.message,
    };
  }
};

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}
