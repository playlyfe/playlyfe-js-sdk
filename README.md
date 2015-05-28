![Playlyfe Javascript SDK](./images/pl-js-sdk.png "Playlyfe Javascript SDK")

Playlyfe Javascript SDK
=======================
The Playlyfe Javascript allows developers to access the Playlyfe API in browser applications. This sdk uses the OAuth 2.0 implicit grant flow to obtain an access token which can then be used to make API calls.

Visit the official [Playlyfe Developers Documentaion](http://dev.playlyfe.com/)

> Note: Breaking Changes this is the new version of the sdk which uses the Playlyfe api v2 by default if you still want to use the v1 api you can do that so by passing a version key in the options when creating a client with 'v1' as the value.

## 1. Implicit Grant Flow
In this flow you need to pass your clienr_id and redirect_uri. Then you need to authenticate your user to the playlyfe Website using the login urr and after authentication, the Playlyfe Server will make a get request to the redirect uri with the access token. Below is a simple single page application that opens up a notification stream to receive notifications.
```js
Playlyfe.init({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: 'YOUR_REDIRECT_URI',
  version: 'v1'
});
```
### Example
```html
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
        redirect_uri: 'YOUR_REDIRECT_URI',
        version: 'v1'
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
    <h1>Logging In</h1>
  </body>
</html>
```

## 2. Custom Login Flow using JWT(JSON Web Token)
In this flow your own backend server has to generate a json web token and send it to the frontend when a user logs in. This will authenticate the user as a player on Playlyfe and make requests on his behalf. To generate the JWT you can use any of our backend sdks as they provide this functionality for you already. You can checkout [Node SDK](https://github.com/playlyfe/playlyfe-node-sdk) for more information on implementing the backend part.
```js
Playlyfe.init({
 jwt: 'the json web token sent from your backend on user login'
});
```
### Example
```html
<html>
  <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js" ></script>
    <script type="text/javascript" src="pl.min.js"></script>
    <script type="text/javascript">
      var player_id = 'student1';
      var env       = 'staging';
      var game_id   = 'are';

      var notification_handler = function (data) {
        console.log("Received Notification: ", data);
      }

      // Open up a front-end client
      var client = new Playlyfe.init({
        version: 'v1',
        jwt: 'jwt token here'
      });
      client.api('/player', function(data) {
        console.log(data);
      });
      // Fetch a notification stream authorization token
      client.api('/notifications/token', 'GET', function (data) {
        console.log(data);
         // Open a notification stream for a specific player
         Playlyfe.openNotificationStream(env, game_id, player_id, data.token, notification_handler);
      });
    </script>
  </head>
  <body>
    <h1>Logging In</h1>
  </body>
</html>
```
##Usage

###Step 1: Include the Playlyfe JS SDK in your page.
The js sdk requires an ajax transport to function properly. Since jQuery has become a ubiquitous library on almost all sites we decided to decouple the ajax transport from the core sdk to cut down the size. You must include either **jQuery**(or **Zepto** for mobile applications) before the **Playlyfe JS SDK**.

    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="pl.min.js"></script>

###Step 2: Create a new client
This initializes the playlyfe js sdk and attempts to connect to Playlyfe. Your Client ID and can be found in the clients menu in the Game Builder.

    Playlyfe.init({
      client_id: 'YOUR_CLIENT_ID',
      redirect_uri: 'YOUR_REDIRECT_URI',
    });

Note that the page at the redirect uri must also have the Playlyfe-JS-SDK script included and configured to successfully complete the Implicit Grant Flow and store the access token which will be provided.

###Step 3: Make an api call
You can now make an API call to Playlyfe using the ```api``` function.

    Playlyfe.api('/player', function(data) {
      console.log(data);
    });

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
    <tr><td>jwt</td><td>The Json web token of the authenticated user</td></tr>
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


License
=======
Playlyfe JS SDK v1.0.0  
http://dev.playlyfe.com/  
Copyright(c) 2014-2015, Playlyfe IT Solutions Pvt. Ltd, support@playlyfe.com  

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
