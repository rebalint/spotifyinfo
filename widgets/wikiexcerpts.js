http = require('https')

module.exports.build = function(app, spotifyAPI, args, callback){
    //assume that args are properly set up
    wikihelper('Metallica', (artistWiki, url) => {
        console.log(typeof(artistWiki))
        app.render('../widgets/views/wikiexcerpts.pug', {artist: artistWiki}, (err, html) => {
            if(err){
                console.log('Something went wrong', err)
            }
            callback(html)
        })
    })
}

async function wikihelper(articleName, callback){
    const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        page: encodeURIComponent(articleName.replace(' ', '_')),
        format: "json",
    });

    try {
        http.get(url, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                callback(JSON.parse(data))
            })
        })       
    } catch (e) {
        console.error(e);
    }
}