Playlyfe Javascript SDK
==================
The Playlyfe Javascript allows developers to access the Playlyfe API in browser applications. This sdk uses the OAuth 2.0 implicit grant flow to obtain an access token which can then be used to make API calls.

Visit the official [Playlyfe Developers Documentaion](http://dev.playlyfe.com/).
##Usage
###Step 1: Include the Playlyfe JS SDK in your page.
The js sdk requires an ajax transport to function properly. Since jQuery has become a ubiquitous library on almost all sites we decided to decouple the ajax transport from the core sdk to cut down the size. You must include either **jQuery**(or **Zepto** for mobile applications) before the **Playlyfe JS SDK**. 

    <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="pl.min.js"></script>

###Step 2: Add a pl-root element to your page.
The pl-root element will contain an iframe used for cross-domain communication with playlyfe.com. This is required to fetch the logged in status of a user on Playlyfe.

    <div id="pl-root"></div>

###Step 3: Attach a login status listener
It is recommended you attach the login listener before calling the ```init``` function to make sure no status change events are lost.

    Playlyfe.onStatusChange(function(status){
      if (status.code === 2) {
        // The user is logged into Playlyfe and has authorized your application
      } else if (status.code === 1) {
        // The user is logged into Playlyfe but has not authorized your application.
      } else {
        // The user is not logged into Playlyfe
      }
    });

###Step 4: Call the init function
This initializes the playlyfe js sdk and attempts to connect to Playlyfe. Your Client ID and can be found in the clients menu in the Game Builder.

    Playlyfe.init({
      client_id: 'YOUR_CLIENT_ID',
      redirect_uri: 'YOUR_REDIRECT_URI'
    });
    
Note that the page at the redirect uri must also have the Playlyfe-JS-SDK script included and configured to successfully complete the Implicit Grant Flow and store the access token which will be provided.


###Step 5: Make an api call
You can now make an API call to Playlyfe using the ```api``` function.

    Playlyfe.api('/me', function(data) {
      console.log(data);
    }); 


## Complete Example
Below is a complete simple single page application that fetches and displays the player's profile information after logging in.

    <!DOCTYPE html>
    <html>
      <head>
        <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
        <script src="pl.min.js"></script>
        <script>
          $(document).ready(function() {
            Playlyfe.onStatusChange(function(status){
              if (status.code === 2) {
                console.log('connected');

                // Display Logout link if logged in
                $("#login").text('Logout');
                $("#login").click(function(){
                  
                  // Logout from playlyfe
                  Playlyfe.logout();
                });
                Playlyfe.api('/me', function(data){
                  $("#profile").text(JSON.stringify(data));
                });
              } else {
                console.log('not connected');

                // Display Login link if logged out
                $("#login").text('Login');
                $("#login").click(function(){

                  // Login to playlyfe
                  Playlyfe.login();
                });
                // Clear profile info
                $("#profile").empty();
              }
            });

            // Initialize the Playlyfe JS SDK
            Playlyfe.init({
              client_id: 'YOUR_CLIENT_ID',
              redirect_uri: 'YOUR_REDIRECT_URI'
            });

          });
        </script>
      </head>
      <body>
        <a id="login" href="#"></a>
        <div id="profile"></div>
        <div id="pl-root"></div>
      </body>
    </html>

## Using a API server proxy
Due to the inherent risks associated with using the Implicit Grant Flow when an untrusted client is used we have provided the option to proxy all the api calls to a server which can use the more secure Authorization Code Flow to connect to the Playlyfe Platform. 

To use this functionality simply pass a ```proxy``` option to the ```init``` function. No client id or redirect uri is required to be stored on the client side. For a complete example application check out the sample [Playlyfe Express Application](https://github.com/playlyfe/playlyfe-express-app)



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
    <tr><td>proxy</td><td>Server side proxy endpoint to which all api calls will be made.</td></tr>
  </tbody>
</table>


### api(route, method, data, callback)
Execute an API call. Visit the complete [API reference](http://dev.playlyfe.com/docs/api)

### onStatusChange(callback)
Registers the callback as a listener which is fired whenever the status of the user's session changes. 

Returns a token which can be used to remove the callback from the list of listeners.

### offStatusChange(listener)
Removes a status listener previously attached with ```onStatusChange```
##### Example
    token = Playlyfe.onStatusChange(function(status){ 
      console.log(status); 
    });
    Playlyfe.offStatusChange(token);

### getStatus()
Returns the status of the user's session since the last time ```playlyfe.com``` was contacted.

### getCurrentStatus()
Contacts ```playlyfe.com``` and retrieves the current status of the user's session. This method is asynchronous and does not return anything. Any changes to status of the session will be notified to all registered status listeners. 

### getLoginLink()
Returns a url that can be used to login into the application on Playlyfe. Can only be used after calling ```init```.

### getLogoutLink()
Returns a url that can be used to logout of the application on Playlyfe. Can only be used after calling ```init```.

## License
[The MIT License](http://opensource.org/licenses/MIT)
