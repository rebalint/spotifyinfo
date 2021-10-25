require('dotenv').config()

//EXPRESS SETUP
const express = require('express')
const app = express()
const port = process.env.PORT

const session = require('express-session')
const { render } = require('pug')
const MemoryStore = require('memorystore')(session)

app.use('/static', express.static('static'))

app.use(session({
    cookie: {maxAge: 86400000},
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}))

var sessions = new Map()

app.set('view engine', 'pug')

//SPOTIFY SETUP
var SpotifyWebApi = require('spotify-web-api-node')

var redirectUri = process.env.BASE_URL + `:${port}` + process.env.REDIRECT_URI

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
})

var scopes = ['user-read-playback-state', 'user-read-private']

//WIDGET SETUP
//temp solution, replace this with autoload
const nowplaying = require('./widgets/nowplaying')
const wikiexcerpts = require('./widgets/wikiexcerpts')
const audiofeatures = require('./widgets/audiofeatures')

const defaultWidgetSet = [nowplaying, wikiexcerpts, audiofeatures]

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
        defaultViewGather((args) => {
            buildWidgets(defaultWidgetSet, args, (rendered) => {
                res.render('index', {'name': args.userdata.body.display_name, 'widgets': rendered})
            })
        })
    }
})

app.get(process.env.REDIRECT_URI, (req, res) => {
    //get auth code
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
function buildWidgets(widgetSet, args, callback) {
    //convert widgetSet into an array of promises
    let promises = widgetSet.map((widget) => {
        return new Promise((resolve, reject) => {
            //TODO add logic to determine what data should be passed to the widget
            widget.build(app, spotifyApi, args, (html) => {
                resolve(html)
            })
        })
    })
    
    //cb the result array once resolved
    Promise.allSettled(promises).then((rendered) => {
        callback(rendered)
    })
}

//gathers all data needed to render the full widget set
//return an object of everything, this should get expanded soon
function defaultViewGather(callback){
    //assume api tokens are already properly set up to auth the user we need
    spotifyApi.getMe()
        .then((userdata) => {
            spotifyApi.getMyCurrentPlayingTrack()
                .then((currentplaying) => {
                    callback({userdata: userdata, 
                        song: currentplaying.body.item})
                }, (err) => {
                    console.log('Something went wrong.', err)
                })
        }, (err) => {
            console.log('Something went wrong.', err)
        })
}