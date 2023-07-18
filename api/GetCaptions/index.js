var { getSubtitles } = require('youtube-caption-extractor');
var fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    // parse the id off the body
    const { videoUrl } = req.body;

    const videoId = videoUrl.split("v=")[1] || videoUrl.split("/").pop();

    const videoCaptions = await getSubtitles({ videoID: videoId, lang: 'en' });

    let formattedCaptions = "";
    videoCaptions.forEach((caption) => {
      formattedCaptions += `[{start: ${caption.start}}, {dur: ${caption.dur}}, {text: ${caption.text}}]\n\n`;
    });

    context.res = {
      // status: 200, /* Defaults to 200 */
      body: { captions: formattedCaptions }
    }
  }
  catch (error) {
    context.res = {
      status: 500,
      body: error.message
    };
  }
};
