(function() {
  var Playlyfe = function($, eio) {
    // 0 - unknown, 1 - logged in, 2 - connected
    var status = { code: -1, msg: 'unintialized' };
    var settings = {};

    var uid = -1;
    var c_access_token = null;

    var LOGOUT_ENDPOINT = 'https://playlyfe.com/logout';
    var TOKEN_ENDPOINT = 'https://playlyfe.com/auth';
    var API_ENDPOINT = 'https://api.playlyfe.com/';

    // Utility functions
    var _toString = Object.prototype.toString;
    function isDate(o)   { return '[object Date]'   == _toString.call(o); }
    function isRegExp(o) { return '[object RegExp]' == _toString.call(o); }
    function isString(o)   { return '[object String]'   == _toString.call(o); }
    function isObject(o)   { return '[object Object]'   == _toString.call(o); }
    function isArray(o)   { return '[object Array]'   == _toString.call(o); }
    function isFunction(o)   { return '[object Function]'   == _toString.call(o); }

    var QS = {

      encode: function(params) {
        var pairs = [], key, val;
        for (key in params) {
          val = params[key];
          if (val !== null && typeof val != 'undefined') {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
          }
        }
        pairs.sort();
        return pairs.join('&');
      },

      decode: function(str) {
        var params = {}, parts  = str.split('&'), i, pair;
        for (i=0; i<parts.length; i++) {
          pair = parts[i].split('=', 2);
          if (pair && pair[0]) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
          }
        }
        return params;
      }

    };

    var Cookie = {

      get: function get(name) {
          return Cookie.has(name) ? Cookie.list()[name] : null;
      },

      list: function list(nameRegExp) {
          var pairs = document.cookie.split(';'), pair, result = {};
          for (var index = 0, len = pairs.length; index < len; ++index) {
              pair = pairs[index].split('=');
              pair[0] = pair[0].replace(/^\s+|\s+$/, '');
              if (!isRegExp(nameRegExp) || nameRegExp.test(pair[0]))
                  result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
          }
          return result;
      },

      has: function has(name) {
          return new RegExp("(?:;\\s*|^)" + encodeURIComponent(name) + '=').test(document.cookie);
      },

      remove: function remove(name, options) {
          var opt2 = {};
          for (var key in (options || {})) opt2[key] = options[key];
          opt2.expires = new Date(0);
          opt2.maxAge = -1;
          return Cookie.set(name, null, opt2);
      },

      set: function set(name, value, options) {
          options = options || {};
          var def = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];
          if (options.path) def.push('path=' + options.path);
          if (options.domain) def.push('domain=' + options.domain);
          var maxAge = 'maxAge' in options ? options.maxAge : ('max_age' in options ? options.max_age : options['max-age']), maxAgeNbr;
          if ('undefined' != typeof maxAge && 'null' != typeof maxAge && (!isNaN(maxAgeNbr = parseFloat(maxAge))))
              def.push('max-age=' + maxAgeNbr);
          var expires = isDate(options.expires) ? options.expires.toUTCString() : options.expires;
          if (expires) def.push('expires=' + expires);
          if (options.secure) def.push('secure');
          def = def.join(';');
          document.cookie = def;
          return def;
      }

    };

    return {

      init: function(options) {
        settings.debug = options.debug;


        settings.version = options.version || 'v2';
        if(options.jwt) {
          // For custom login flow
          settings.jwt = options.jwt;
        }
        else {
          // For simple client side implict grant flow
          settings.client_id = options.client_id;
          settings.redirect_uri = options.redirect_uri;
        }

        var session = QS.decode(window.location.hash.slice(1));
        c_access_token = 'pl_'+settings.client_id+'_access_token';

        if (session && session.access_token && session.token_type) {
          window.location.hash = '';
          // Set default token duration
          if(session.expires_in === undefined) session.expires_in = 3600;
          var now = new Date();
          var expires_on = new Date(now.getTime() + session.expires_in * 1000);
          Cookie.set(c_access_token, session.access_token,  { expires: expires_on });
        }

        this.getAccessToken = function() {
          return Cookie.get(c_access_token);
        };

        this.api =  function() {
          var args = Array.prototype.slice.call(arguments);
          var _route, _method = 'GET', _data = {}, _callback;

          // Check route
          if(args[0] === undefined || !isString(args[0])) throw Error('Invalid API route');
          else _route = args[0];

          // Check callback
          if(!isFunction(args[args.length-1])) throw Error('Invalid callback provided, please provide a function');
          else _callback = args[args.length-1];

          if (args.length >= 3) {
            // fn (route, method, callback)
            if(!isString(args[1])) throw Error('Invalid method provided, please use GET, POST, PUT or DELETE');
            _method = args[1];
            if(!(_method === 'GET' || _method === 'PUT' || _method === 'DELETE' || _method === 'POST')) throw Error('Invalid method provided, please use GET, POST, PUT or DELETE');
          }
          if (args.length === 4) {
            // fn (route, method, data, callback)
            if(!isObject(args[2]) && !isArray(args[2])) throw Error('Invalid parameters provided, only JSON objects are accepted');
            if(_method === 'GET') throw Error('GET requests cannot pass data');
            else _data = args[2];
          }

          var _handleError = function (data) {
            response = JSON.parse(data.responseText);
            if(response.error === 'invalid_grant') {
              console.log(response.error_description);
            }
          };
          // Make oauth call
          try {
            return this.oAuthCall(_route, _method, JSON.stringify(_data), _callback, _handleError);
          } catch (e) {
            console.log(e.stack);
          }
        };

        this.getLoginLink = function() {
          return 'https://playlyfe.com/auth?response_type=token&client_id=' + encodeURIComponent(settings.client_id) + '&redirect_uri=' + encodeURIComponent(settings.redirect_uri);
        };

        this.getLogoutLink = function() {
          return LOGOUT_ENDPOINT;
        };

        this.oAuthCall = function (route, method, data, success, error) {

          var access_token = this.getAccessToken();

          if (settings.jwt !== null) {
            var query_pos = route.indexOf('?');
            var query = (query_pos > 0) ? route.slice(query_pos + 1) : '';
            var path = (query_pos > 0) ? route.slice(0, query_pos): route;
            route = path + '?' + QS.encode({ jwt: settings.jwt }) + ( (query.length > 0) ? ('&' + query) : '' );
          } else if(access_token !== null) {
            // Attach access token
            var query_pos = route.indexOf('?');
            var query = (query_pos > 0) ? route.slice(query_pos + 1) : '';
            var path = (query_pos > 0) ? route.slice(0, query_pos): route;
            route = path + '?' + QS.encode({ access_token: access_token }) + ( (query.length > 0) ? ('&' + query) : '' );
          } else {
            throw new Error('No access token found');
          }

          if(settings.debug) console.log(route, method, data);

          ajaxOptions = {
            url: API_ENDPOINT + settings.version + route,
            type: method,
            dataType: 'json',
            contentType: 'application/json',
            processData: false,
            crossDomain: true,
            data: data,
            success: success,
            error: error
          };

          if( method !== 'POST' && method !== 'PUT') {
            delete ajaxOptions.contentType;
            delete ajaxOptions.data;
          }

          return $.ajax(ajaxOptions);
        };

        this.login = function() {
          window.location = this.getLoginLink();
        };

        this.logout = function(callback) {
          this.api('/logout','POST', callback);
          Cookie.remove(c_access_token);
        };

        if (Cookie.get(c_access_token) != null) {
          status = { code: 1, msg: 'authenticated' };
        } else {
          status = { code: 0, msg: 'unknown' };
        }
      },

      getStatus: function() {
        return status;
      },

      openNotificationStream: function (env, game_id, player_id, token, success, error) {
        var socket = new eio.Socket({
          host: 'api.playlyfe.com',
          port: 443,
          secure: true,
          path: '/v1/notifications/stream',
          transports: ['websocket', 'polling']
        });
        var state = -1
        socket.on('open', function () {
          console.info('Sockets Open');
          socket.on('message', function (msg) {
            switch (msg) {
              case 'AUTH_CHALLENGE':
                socket.send("AUTH_RESPONSE " + token + " player " + env + " " + game_id + " " + player_id);
                break;
              case 'AUTH_SUCCESS':
                console.info('Notifications Up');
                break;
              default:
                if (msg.indexOf('AUTH_FAILED') > -1) {
                  if (error != null) {
                    error(new Error('Socket Authorization Failed: ' + msg));
                  } else {
                    throw new Error('Socket Authorization Failed: ' + msg);
                  }
                } else {
                  msg = JSON.parse(msg.slice(msg.indexOf(' ')));
                  success(msg);
                }
            }
          });
        });
        return socket;
      }

    };
  };

  if (typeof define !== 'undefined') {
    define('playlyfe', ['jquery', 'eio'], function ($, eio) { return new Playlyfe($, eio); });
  } else {
    var $ = window.jQuery;
    var eio = window.eio;
    window.Playlyfe = new Playlyfe($, eio);
  }
  return;
}());
