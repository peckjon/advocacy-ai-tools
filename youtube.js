const channelEL = htmx.find("#channel");

async function logIn() {
  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */

  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement("form");
  form.setAttribute("method", "GET"); // Send as a GET request.
  form.setAttribute("action", oauth2Endpoint);

  // the redirect uri must match the current host
  const redirectUri = window.location.origin;

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {
    client_id:
      "784224902938-5j8d4n59vqve1s9va20up4oklh6u7o34.apps.googleusercontent.com",
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    include_granted_scopes: "true",
    state: "pass-through value",
  };

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", p);
    input.setAttribute("value", params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

async function checkLogin(accessToken) {
  if (accessToken) {
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=" +
        accessToken
    );

    // if the request fails, send the user through the login flow again
    if (response.status === 401) {
      this.logIn();
    } else {
      const data = await response.json();
      channelEL.text = data.items[0].snippet.title;
    }
  }
}

checkLogin(localStorage.getItem("accessToken"));
