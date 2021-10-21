# Spotifyinfo

A website which allows users to log in with their spotify account and get access to information related to the track they are currently listening to.

# TODO

- [x] set up sessions
    - [x] store spotify user auth data based on session id
- [x] set up widgets system
    - [x] example widget: nowplaying
- [ ] multiple accounts and devices test of framework
- [ ] make widgets
    - [x] nowplaying
    - [ ] wikiexcerpts
    - [ ] songRecs
        - [ ] let user play recommended songs
        - [ ] let user add recommended songs to playlists
    - [ ] lyrics
    - [ ] audiofeatures
    - [ ] discogs
- [ ] expand framework to handle tool widgets
- [ ] make tool widgets
    - [ ] generate seeded recommendation playlists
    - [ ] copy a playlist to the user profile

# Docs

## index.js

Entry point, contains general setup, routing and calls to everything else.

## Widgets

The project is mainly composed of various widgets. Each widget has a standardized `build(app, spotifyAPI, args, callback)` function. Callback has one argument, `body`, a rendered html containing the end product of the widget. `spotifyAPI` should be configured with the correct credentials before a widget is called. `args` should be an object containing anything the widget needs in addition to these. Each widget should have one .js file and a .pug file of the same name in widgets/views. If multiple views are used, every pug file's name should start with the widget name, followed by _ and view name.

### nowplaying

Returns a view of the user's currently played song.

Args: none

### wikiexcerpts

Returns links and short summaries of the wikipedia pages of the song, album and artists (if articles of these are avaliable)

Args: none

### songRecs

Gives several recommendations seeded with the currently playing song using spotify.

Args: none

### lyrics

Displays lyrics of the song,

Args: none

### audiofeatures

Displays data supplied by the audio-features spotify API endpoint.

Args: if SpotifyID is given, it gives information for that id, otherwise takes the currently playing track.

### discogs

Uses discogs.com to supply data about the album and artist(s)

Args: none

# Notes