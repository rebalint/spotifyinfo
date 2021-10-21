module.exports.build = function(app, spotifyAPI, args, callback){
    //check if the user is even listening to anything
    spotifyAPI.getMyCurrentPlaybackState()
        .then(function(data){
            if(data.body && data.body.is_playing){
                //get currently playing track
                spotifyAPI.getMyCurrentPlayingTrack()
                    .then(function(nowplaying){
                        app.render('../widgets/views/nowplaying.pug', {data: data}, (err, html) => {
                            if(err) console.log(err)
                            callback(html)
                        })
                    }, function(err){
                        console.log('Something went wrong.', err)
                    })
            } else {
                callback('Not playing anything...')
            }
        }, function(err){
            console.log('Something went wrong.', err)
        })
}