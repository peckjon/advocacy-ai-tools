/**
  * Sample JavaScript code for youtube.captions.list
  * See instructions for running APIs Explorer code samples locally:
  * https://developers.google.com/explorer-help/code-samples#javascript
  */

function authenticate() {
  return gapi.auth2.getAuthInstance()
    .signIn({ scope: "https://www.googleapis.com/auth/youtube.force-ssl" })
    .then(function () { console.log("Sign-in successful"); },
      function (err) { console.error("Error signing in", err); });
}
function loadClient() {
  gapi.client.setApiKey("AIzaSyBNkN_Fjc3ATD3zNxAZzj7ebvgdZgAKQK4");
  return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(function () { console.log("GAPI client loaded for API"); },
      function (err) { console.error("Error loading GAPI client for API", err); });
}
// Make sure the client is loaded and sign-in is complete before calling this method.
function execute() {
  return gapi.client.youtube.captions.download({
    id: "QjvvqR9KyVo",
    tfmt: "srt",
    tlang: "en"
  })
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log("Response", response);
    },
      function (err) { console.error("Execute error", err); });
}
gapi.load("client:auth2", function () {
  gapi.auth2.init({ client_id: "784224902938-5j8d4n59vqve1s9va20up4oklh6u7o34.apps.googleusercontent.com" });
});