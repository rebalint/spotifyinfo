module.exports.build = function(app, spotifyAPI, args, callback){
    setupData(spotifyAPI, args, (data) => {
        render(app, data, callback)
    }, (err) => {
        console.log('Something went wrong', err)
        //give empty string for the html out
        callback('')
    })
}

function setupData(spotifyAPI, args, callback, errorCB){
    if(Object.keys(args).length === 0){
        //no args, get currently playing and proceed with that
        spotifyAPI.getMyCurrentPlayingTrack()
            .then((nowplaying) => {
                callback(nowplaying.item)
            }, (err) => {
                //return the error
                errorCB(err)
            })
    } else{
        //TODO: error handling
        callback(args.song)
    }
}

function render(app, data, cb){
    //check if track is playing
    app.render('../widgets/views/nowplaying.pug', {data: data}, (err, html) => {
        if(err){
            console.log(err)
        }
        cb(html)
    })
}