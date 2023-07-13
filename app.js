const PROMPTS = {
  blogPrompt: "You are a creative writing assistant that writes blog posts when given a trascript from a video.Format all your responses as Markdown. Be entertaining. Fill in code examples where you can guess from the transcript what code is being displayed. Include images that go with the text. Write as long a post as the token limit will allow.",
  descriptionPrompt: "Your task is to write a description for a YouTube video based on the transcript for that video. The descriptions should have 3 sections separated by carriage returns. The first section is a concise, entertaining summary of the transcript no longer than 2 sentences. You may use emoji in the summary. The second section is the timestamps for the sections of the video. You should format the timestamps as HH:MM:SS. The timestamp format in the transcript is HH:MM:SS,Milliseconds. The third section of your response is 3 relevant hashtags.",
  titlePrompt: "Your task is to write a title for a YouTube video based on the transcript for that video. The title should be no longer than 60 characters and should be concise and something that would cause the user to click on the video. Use suspense, humor, and intrigue to get the user to click on the video. Give 10 title suggestions.",
  tweetPrompt: "You are a social media manager. Your task is to write a tweet for a YouTube video based on the transcript for that video. The tweet should be no longer than 200 characters and should be concise. Use portmantues, puns, and wordplay to get the user to click on the video. Give 5 tweet suggestions. Do not use any hashtags.",
  tweetThreadPrompt: "Your task is to write a tweet thread for a new release of vs code based on the release notes which will be given to you as a transcript. Create one tweet for each major item in the release. Use portmantues, puns, and wordplay to make each tweet entertaining. End the thread with a tweet that asks a question. Do not use any hashtags in the thread.",
}

Vue.createApp({
  data() {
    return {
      videoIdOrUrl: "",
      transcript: "",
      accessToken: null,
      openAIResponse: "",
      isActive: false,
      channel: "",
      history: [],
      controller: new AbortController(),
      errorMessage: "",
      selectedPrompt: "blogPrompt",
      showDownloadDetails: false
    }
  },
  mounted() {
    // get the access token if it exists
    this.accessToken = this.getAccessToken();

    // if there is an access token, try a sample request to see if its still valid
    if (this.accessToken) {
      this.checkLogin();
    }

    this.getHistory();


  },
  methods: {
    checkLogin: async function () {
      const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=' + this.accessToken);

      // if the request fails, send the user through the login flow again
      if (response.status === 401) {
        this.logIn();
      }

      else {
        const data = await response.json();
        this.channel = data.items[0].snippet.title;
      }
    },
    getAccessToken: function () {
      // first check to see if the url contains an accessToken query string parameter
      const urlParams = new URLSearchParams(window.location.hash);
      let accessToken = urlParams.get('access_token');

      // if the access token is present, put it in local storage and then remove it from the url
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        window.location.hash = '';
      }
      // otherwise, check to see if the access token is in local storage
      else {
        accessToken = localStorage.getItem('accessToken');
      }

      return accessToken;
    },
    getPrompts: async function () {
      const response = await fetch('/api/GetPrompts');
      const data = await response.json();


    },
    logIn: async function () {
      /*
      * Create form to request access token from Google's OAuth 2.0 server.
      */

      // Google's OAuth 2.0 endpoint for requesting an access token
      var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

      // Create <form> element to submit parameters to OAuth 2.0 endpoint.
      var form = document.createElement('form');
      form.setAttribute('method', 'GET'); // Send as a GET request.
      form.setAttribute('action', oauth2Endpoint);

      // the redirect uri must match the current host
      const redirectUri = window.location.origin;

      // Parameters to pass to OAuth 2.0 endpoint.
      var params = {
        'client_id': '784224902938-5j8d4n59vqve1s9va20up4oklh6u7o34.apps.googleusercontent.com',
        'redirect_uri': redirectUri,
        'response_type': 'token',
        'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
        'include_granted_scopes': 'true',
        'state': 'pass-through value'
      };

      // Add form parameters as hidden input values.
      for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
      }

      // Add form to page and submit it to open the OAuth 2.0 endpoint.
      document.body.appendChild(form);
      form.submit();
    },
    downloadTranscript: async function () {

      this.showDownloadDetails = false;
      this.transcript = "Downloading..."

      if (this.videoIdOrUrl.trim() === "") {
        return this.errorMessage = "Please enter a video id or url";
      }

      const response = await fetch("/api/download", {
        method: 'POST',
        body: JSON.stringify({
          videoIdOrUrl: this.videoIdOrUrl,
          accessToken: this.accessToken
        })
      });

      const data = await response.text();

      this.transcript = data;
    },
    async generate(prompt) {

      if (this.transcript === "") {
        return this.errorMessage = "Please enter a transcript";
      }

      this.isActive = true;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: PROMPTS[this.selectedPrompt],
          transcript: this.transcript
        }),
        signal: this.controller.signal
      });

      if (response.status !== 200) {
        return this.message = `${response.status}: ${response.statusText}`;
      }

      const data = await response.json();
      this.openAIResponse = data.choices[0].message.content;

      // add the response to the history and save to local storage
      this.history.push({
        id: new Date().getTime() / 1000,
        timestamp: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true }),
        response: this.openAIResponse,
      });

      localStorage.setItem('history', JSON.stringify(this.history));

      this.isActive = false;
    },
    getHistory: function () {
      const history = localStorage.getItem('history');

      // if the history element is present, parse it and set it to the history variable
      if (history) {
        this.history = JSON.parse(history);
      }
    },
    getHistoryItem: function (id) {
      const item = this.history.find(item => item.id === id);
      this.openAIResponse = item.response;
    },
    deleteHistoryItem: function (id) {
      const index = this.history.findIndex(item => item.id === id);
      this.history.splice(index, 1);
      localStorage.setItem('history', JSON.stringify(this.history));
    }
  }
}).mount('#app');