Playlyfe Javascript SDK
==================
The Playlyfe Javascript allows developers to access the Playlyfe API in browser applications. This sdk uses the OAuth 2.0 implicit grant flow to obtain an access token which can then be used to make API calls.

Visit the official [Playlyfe Developers Documentaion](http://dev.playlyfe.com/).
##Usage

###Step 1: Include the Playlyfe JS SDK in your page.
The js sdk requires an ajax transport to function properly. Since jQuery has become a ubiquitous library on almost all sites we decided to decouple the ajax transport from the core sdk to cut down the size. You must include either **jQuery**(or **Zepto** for mobile applications) before the **Playlyfe JS SDK**.

    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="pl.min.js"></script>

###Step 2: Create a new client
This initializes the playlyfe js sdk and attempts to connect to Playlyfe. Your Client ID and can be found in the clients menu in the Game Builder.

    Playlyfe.init({
      client_id: 'YOUR_CLIENT_ID',
      redirect_uri: 'YOUR_REDIRECT_URI'
    });

Note that the page at the redirect uri must also have the Playlyfe-JS-SDK script included and configured to successfully complete the Implicit Grant Flow and store the access token which will be provided.

###Step 3: Make an api call
You can now make an API call to Playlyfe using the ```api``` function.

    Playlyfe.api('/player', function(data) {
      console.log(data);
    });


## Complete Example
Below is a simple single page application that opens up a notification stream to receive notifications.

    <!DOCTYPE html>
    <html>
      <head>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script type="text/javascript" src="pl.min.js"></script>
        <script type="text/javascript">
          var player_id = 'YOUR_PLAYER_ID';
          var env = 'YOUR_GAME_ENVIRONMENT ( "staging" or "production" )';
          var game_id = 'YOUR_GAME_ID';

          var notification_handler = function (data) {
            console.log("Received Notification: ", data);
          }

          // Open up a front-end client
          var client = new Playlyfe.init({
            client_id: 'YOUR_CLIENT_ID',
            redirect_uri: 'YOUR_REDIRECT_URI'
          });
          // If the user is not logged in then login
          if (Playlyfe.getStatus().msg !== 'authenticated') {
            client.login();
          } else {
            // Fetch a notification stream authorization token
            client.api('/notifications/token?player_id=' + player_id, 'GET', function (data) {
               // Open a notification stream for a specific player
               Playlyfe.openNotificationStream(env, game_id, player_id, data.token, notification_handler);
            });
          }
        </script>
      </head>
      <body>
      </body>
    </html>

## Methods

### init(options)
Initializes the sdk with the given configuration.
##### Options
<table>
  <thead>
    <tr><th>Parameter</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>client_id</td><td>Client ID of the application.</td></tr>
    <tr><td>redirect_uri</td><td>URI to which the user is redirected after approving the application on playlyfe.</td></tr>
    <tr><td>debug</td><td>Print debug output in the console window. (default: false)</td></tr>
  </tbody>
</table>


### api(route, method, data, callback)
Execute an API call. Visit the complete [API reference](http://dev.playlyfe.com/docs/api)

### getStatus()
Returns the status of the user's session since the last time ```playlyfe.com``` was contacted.

### getLoginLink()
Returns a url that can be used to login into the application on Playlyfe. Can only be used after calling ```init```.

### getLogoutLink()
Returns a url that can be used to logout of the application on Playlyfe. Can only be used after calling ```init```.

### openNotificationStream(environment, game_id, player_id, token, success_handler, error_handler)
Open a notification stream for the specified player in a game in a particular environment (staging or production). The token value here must be obtained from the route `/notifications/token` after authenticating the client. You can also pass in the token information from your own backend after generating it over there through a server side API to the `/notifications/token` endpoint.

## License
[The MIT License](http://opensource.org/licenses/MIT)
