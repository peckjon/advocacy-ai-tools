
Vue.createApp({
  data() {
    return {
      videoId: "",
      apiKey: "AIzaSyBNkN_Fjc3ATD3zNxAZzj7ebvgdZgAKQK4",
      accessToken: null,
      blogPost: "",
      isActive: false
    }
  },
  mounted() {
    // see if there is an access_token on the url
    const urlParams = new URLSearchParams(window.location.hash);
    this.accessToken = urlParams.get('access_token');
  },
  methods: {
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
        'redirect_uri': 'http://localhost:3000/callback',
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
    async generateBlogPost() {

      this.isActive = true;

      const videoId = this.videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[^\w-]|$)/)[1];

      const result = await fetch(`/download?accessToken=${this.accessToken}&videoId=${videoId}`);
      const post = await result.text();

      this.blogPost = post;

      this.isActive = false;
    }
  }
}).mount('#app');