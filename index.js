require('dotenv').config()

//EXPRESS SETUP
const express = require('express')
const app = express()
const port = process.env.PORT

const session = require('express-session')
const { render } = require('pug')
const MemoryStore = require('memorystore')(session)

app.use(session({
    cookie: {maxAge: 86400000},
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    secret: process.env.SESSION_SECRET
}))

var sessions = new Map()

app.set('view engine', 'pug')

//SPOTIFY SETUP
var SpotifyWebApi = require('spotify-web-api-node')

var redirectUri = 'http://localhost:8888' + process.env.REDIRECT_URI

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
})

var scopes = ['user-read-playback-state', 'user-read-private']

//WIDGET SETUP
//temp solution, replace this with autoload
const nowplaying = require('./widgets/nowplaying')

const defaultWidgetSet = [nowplaying]

//ROUTING
app.get('/', (req, res) => {
    if(!sessions.has(req.sessionID)){
        //start auth flow
        var state = 'TODO change this'
        var authUrl = spotifyApi.createAuthorizeURL(scopes, state)
        res.redirect(authUrl)
    } else {
        spotifyApi.setAccessToken(sessions.get(req.sessionID).accessToken)
        spotifyApi.setRefreshToken(sessions.get(req.sessionID).refreshToken)
        var userName = spotifyApi.getMe()
            .then(function(data){
                buildWidgets(defaultWidgetSet, (rendered) => {
                    res.render('index', {'name': data.body.display_name, 'widgets': rendered})
                })
            })
    }
})

app.get(process.env.REDIRECT_URI, (req, res) => {
    //get auth code
    console.log('Callback URI got requested, storing tokens')
    var code = req.query.code

    if(code != undefined){
        //set access and refresh tokens
        spotifyApi.authorizationCodeGrant(code).then(
            function(data) {
                //create new session in sessions, set data and add it
                var newSession = {
                    'accessToken': data.body['access_token'],
                    'refreshToken': data.body['refresh_token']
                }
                
                sessions.set(req.sessionID, newSession)
            },
            function(err) {
              console.log('Something went wrong!', err);
            }
        )
        res.redirect('/')
    } else {
        console.log(req.query.err)
        res.send('Something went wrong.')
    }
})

app.listen(port, () => {
    console.log(`App started on port ${port}`)
})


//Takes an array of widgets in widgetSet, builds all of them and returns an array of rendered html of them
function buildWidgets(widgetSet, callback) {
    //convert widgetSet into an array of promises
    let promises = widgetSet.map((widget) => {
        return new Promise((resolve, reject) => {
            widget.build(app, spotifyApi, {}, (html) => {
                resolve(html)
            })
        })
    })
    
    //cb the result array once resolved
    Promise.allSettled(promises).then((rendered) => {
        callback(rendered)
    })
}