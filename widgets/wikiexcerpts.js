http = require('https')

module.exports.build = function(app, spotifyAPI, args, callback){
    //assume that args are properly set up
    wikihelper(args.body.item.artists[0].name, (artistWiki, url) => {
        wikihelper(args.body.item.album.name + " (album)", (albumWiki) => {
            wikihelper(args.body.item.name + " (song)", (songWiki) => {
                var wikis = [artistWiki, albumWiki, songWiki]

                var filtered = wikis.filter(function (el) {
                    return el != null
                  })

                //TODO: add url pointing to article to each entry and display
                app.render('../widgets/views/wikiexcerpts.pug', {wikis: wikis}, (err, html) => {
                    if(err){
                        console.log('Something went wrong', err)
                    }
                    callback(html)
                })
            })
        })
    })
}

async function wikihelper(articleName, callback){
    //TODO: use a proper search or something
    const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "query",
        prop: "extracts",
        exintro: true,
        titles: encodeURIComponent((articleName).replace(' ', '_')),
        format: "json",
    });

    try {
        http.get(url, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                ret = JSON.parse(data)
                if(JSON.parse(data).query.pages.hasOwnProperty('-1')){
                    callback(null)
                } else {
                    callback(ret)
                }
            })
        })       
    } catch (e) {
        console.error(e);
    }
}