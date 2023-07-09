// create a simple express server that serves index.html. It should also serve any files at the /public directory from the public folder.

const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.static('public'));

const API_KEY = "AIzaSyBNkN_Fjc3ATD3zNxAZzj7ebvgdZgAKQK4";
const OPEN_AI_API_KEY = "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"

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// handle the callback from YouTube auth that contains the access token
app.get('/callback', (req, res) => {
  // parse off the access token from the query string
  const accessToken = req.query.access_token;

  // store as a cookie on the client
  res.cookie('accessToken', accessToken);

  // redirect back to the main page
  res.redirect('/');
});

// download function
app.get('/download', async (req, res) => {
  // get the access token from the query string
  const accessToken = req.query.accessToken;
  const videoId = req.query.videoId;


  // if there is no access token, return an error
  if (!accessToken) {
    return res.status(401).send({
      error: 'You must be logged in to view this resource'
    });
  }

  // first, we need to get the id for the video caption track
  const result = await fetch(`https://youtube.googleapis.com/youtube/v3/captions?part=id&videoId=${videoId}&key=${API_KEY}`, {
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

  // remove all carriage returns
  trackText = trackText.replace(/\r/g, "");

  // get every 3rd line in the track text
  trackText = trackText.split("\n").filter((line, index) => {
    return index % 4 === 2;
  }).join(" ");

  // call the OpenAI API to generate a summary
  let openAIReq = {
    model: "gpt-3.5-turbo",
    messages: [{ "role": "system", "content": "You are an auto blogging AI. Format all your responses as HTML but leave off the html, head and body tags." }, { "role": "user", "content": "Write a blog post based on the following transcript: " + trackText }]
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_AI_API_KEY}`,
    },
    body: JSON.stringify(openAIReq),
  });

  const json = await response.json();

  if (json.error) {
    console.log(json.error);
  }

  console.log(json);

  res.send(json["choices"][0]["message"]["content"]);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

