
Vue.createApp({
  data() {
    return {
      videoId: "",
      transcript: "",
      apiKey: "AIzaSyBNkN_Fjc3ATD3zNxAZzj7ebvgdZgAKQK4",
      accessToken: null,
      openAIResponse: "",
      isActive: false
    }
  },
  mounted() {
    // see if there is an access_token on the url
    const urlParams = new URLSearchParams(window.location.hash);
    this.accessToken = urlParams.get('access_token');

    this.getUserInfo();
  },
  methods: {
    getUserInfo: async function () {
      // get the user info from the /api/me endpoint passing the accessToken on the body of the request
      const result = await fetch('/api/me', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: this.accessToken
        })
      });

      const data = await result.json();

      console.log(data);
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

      // Parameters to pass to OAuth 2.0 endpoint.
      var params = {
        'client_id': '784224902938-5j8d4n59vqve1s9va20up4oklh6u7o34.apps.googleusercontent.com',
        'redirect_uri': 'http://localhost:4280',
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
    async generate() {

      if (this.transcript === "") {
        return alert("Please enter a transcript");
      }

      this.isActive = true;

      // we need to remove extraneous characters from the transcript to save space on the request to OpenAI. The following code puts the transcript into a contiguous string with spaces between each word.

      // remove all carriage returns
      let prompt = this.transcript.replace(/\r/g, "");

      // strip out time markers in the format: 0:02:38.059,0:02:40.109 (sbv format)
      prompt = prompt.replace(/\d:\d\d:\d\d.\d\d\d,\d:\d\d:\d\d.\d\d\d/g, "");

      // strip out time markers in the format: 00:00:00,000 --> 00:00:00,000 (srt format)
      prompt = prompt.replace(/\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d/g, "");

      // strip out time markers in the format: 00:00:00.0000 --> 00:00:00.0000 (vtt format)
      prompt = prompt.replace(/\d\d:\d\d:\d\d.\d\d\d\d --> \d\d:\d\d:\d\d.\d\d\d\d/g, "");

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        this.openAIResponse = data.choices[0].message.content;
      }

      else {
        alert("There was an error generating the response: " + response.statusText);
      }

      // const videoId = this.videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[^\w-]|$)/)[1];

      // const result = await fetch(`/download?accessToken=${this.accessToken}&videoId=${videoId}`);
      // const post = await result.text();

      // this.blogPost = post;

      this.isActive = false;
    }
  }
}).mount('#app');