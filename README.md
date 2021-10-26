# Spotifyinfo

A website which allows users to log in with their spotify account and get access to information related to the track they are currently listening to.

# Setup

* register an application with spotify on https://developer.spotify.com/dashboard/applications
* Clone the repo
* `npm install` in the root directory of the repo
* create a file named `.env` and add the following fields:
    ```
    PORT: the port on which you want to run the code
    CLIENT_ID: the client id of your Spotify app
    CLIENT_SECRET: the client secret of your Spotify app
    REDIRECT_URI: the redirect uri of your spotify app, but only the part after the address to this application (so if your redirect is `localhost:8888 callback`, you should set this to `/callback`)
    BASE_URL: the base url of your server (without port number)
    SESSION_SECRET: arbitrary value used to verify session cookies
    ```
* launch the server via `node index.js` from the root of the repo

# TODO

- [ ] make widgets
    - [ ] lyrics
    - [ ] songRecs
        - [ ] let user play recommended songs
        - [ ] let user add recommended songs to playlists
    - [ ] discogs
    - [x] nowplaying
    - [x] wikiexcerpts
        - [x] replace all usage of https with node-fetch
        - [x] add search and make page finding actually function
    - [x] audiofeatures
- [ ] improve ui
    - [ ] make a responsive, good-looking css-based site
    - [ ] add ajax
- [ ] expand framework to handle tool widgets
- [ ] make tool widgets
    - [ ] generate seeded recommendation playlists
    - [ ] copy a playlist to the user profile
- [x] set up sessions
    - [x] store spotify user auth data based on session id
- [x] set up widgets system
    - [x] example widget: nowplaying
- [x] Solve the issue of rate limits
- [x] Refactor to use spotify song item instead of nowplaying returns
- [x] set up statics
- [x] multiple accounts and devices test of framework

# Bugs

# Docs

## index.js

Entry point, contains general setup, routing and calls to everything else.

## Widgets

The project is mainly composed of various widgets. Each widget has a standardized `build(app, spotifyAPI, args, callback)` function. Callback has one argument, `body`, a rendered html containing the end product of the widget. `spotifyAPI` should be configured with the correct credentials before a widget is called. `args` should be an object containing anything the widget needs in addition to these. Each widget should have one .js file and a .pug file of the same name in widgets/views. If multiple views are used, every pug file's name should start with the widget name, followed by _ and view name.

### nowplaying

Returns a view of the user's currently played song.

Args: optionally takes a song item

### wikiexcerpts

Returns links and short summaries of the wikipedia pages of the song, album and artists (if articles of these are avaliable)

Args: a song item

Note: several critical bugs seem to have disappeared with no clear reason. Return here if things get weird.

### songRecs

Gives several recommendations seeded with the currently playing song using spotify.

Args: TODO
```
{
    useCurrentlyPlaying: true,
    currentlyPlaying: {
        //the currentlyPlaying object
    }
    spotifyIDs: [

    ]

}
```

### lyrics

Displays lyrics of the song using the Genius api.

Args: a song item

### audiofeatures

Displays data supplied by the audio-features spotify API endpoint.

Args: a song item

### discogs

Uses discogs.com to supply data about the album and artist(s)

Args: a song item

# Notes
    

