const genAPI = require('genius-lyrics')
const genclient = new genAPI.Client()

module.exports.build = function(app, spotifyAPI, args, callback){
    let res = getLyrics(args, (lyrics, song) => {
        if(lyrics == null){
            callback('')
        } else {
            lyrics = lyrics.replace(/(?:\r\n|\r|\n)/g, '<br>')
            app.render('../widgets/views/lyrics.pug', {lyrics: lyrics, song: song}, (err, html) => {
                if(err){
                    console.log('Something went wrong:', err)
                    callback('')
                }
                callback(html)
            })
        }
    })
}

async function getLyrics(args, callback){
    try{
        const searches = await genclient.songs.search(args.song.artists[0].name + ' ' + args.song.name)
        //this will be good enough most of the time™
        if(searches.length == 0){
            callback(null)
        }
        song = searches[0]

        if(song === undefined){
            callback(null)
        } else {
            lyrics = await song.lyrics()
            callback(lyrics, song)
        }
    }
    catch(err){
        if(err.message == 'No result was found'){
            //remove the stupid fucking error on no results from the genius api
            callback(null)
        } else {
            console.log('Something went wrong', err)
            callback(null)
        }
    }
}