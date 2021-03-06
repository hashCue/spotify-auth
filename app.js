const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

require('dotenv').config()

const client_id = process.env.client_id
const client_secret = process.env.client_secret
const redirect_uri = process.env.redirect_uri
 // Your redirect uri


const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


app.get('/', function(req, res) {
  res.send('working')
})

app.get('/login', function(req, res) {

  let state = generateRandomString(16);
//   res.cookie(stateKey, state);

  let scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';
  res.send('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri, 
    //   state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;


  var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
      },
      headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
  };

  request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

      var access_token = body.access_token,
          refresh_token = body.refresh_token;

      var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
      };

      // use the access token to access the Spotify Web API
      // request.get(options, function(error, response, body) {
      //     console.log(body);
      // });

      // we can also pass the token to the browser to make requests from there
      res.send({
          access_token: access_token,
          refresh_token: refresh_token
        })
      } else {
      res.send('/#' +
          querystring.stringify({
          error: 'invalid_token'
          }));
      }
  });

});

app.get('/refresh_token', function(req, res) {
  console.log('access refresh endpoint')
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
``
  request.post(authOptions, function(error, response, body) {
    console.log('test inside the post')
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('listening on port ${process.env.PORT}');
app.listen(process.env.PORT || 5000)
