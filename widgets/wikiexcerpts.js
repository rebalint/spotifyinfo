const http = require('https')
const fetch = require('node-fetch')

module.exports.build = function(app, spotifyAPI, args, callback){
    //assume that args are properly set 
    //TODO autobuild this to include all artists
    let helpers = []
    args.body.item.artists.forEach(artist => {
        helpers.push(wikihelper(artist.id, 'artist'))         
    });
    helpers.push(wikihelper(args.body.item.album.id, 'album'), wikihelper(args.body.item.id, 'song'))
    Promise.allSettled(helpers).then((wikis) => {
        var filtered = wikis.filter(function (el) {
            if(el.value != null){
                return el
            }
          })

        if(filtered.length == 0){
            callback('')
        } else {
            app.render('../widgets/views/wikiexcerpts.pug', {wikis: filtered}, (err, html) => {
                if(err){
                    console.log('Something went wrong', err)
                }
                callback(html)
            })
        }
    })
    .catch(err => console.log(err))
}

function wikihelper(spotifyID, type){
    //search for the article name
    return new Promise((resolve, reject) => {
        wikiSearch(spotifyID, type)
            .then(WPName => {
                if(WPName == null){
                    resolve(null)
                }
                const url = "https://en.wikipedia.org/w/api.php?" +
                new URLSearchParams({
                    origin: "*",
                    action: "query",
                    prop: "extracts",
                    exintro: true,
                    titles: WPName,
                    format: "json",
                });
                http.get(url, (res) => {
                    let data = ''
                    res.on('data', (chunk) => {
                        data += chunk
                    })
                    res.on('end', () => {
                        ret = JSON.parse(data)
                        //filter out the page returned by querying the page titled 'Null'
                        if(ret.query.pages.hasOwnProperty('21712')){
                            resolve(null)
                        } else {
                            ret.pageUrl = 'https://en.wikipedia.org/wiki/' + WPName
                            //console.log(ret.query)
                            resolve(ret)
                        }
                    })
                })       
        
        })
        .catch(err => reject(err))
    })
}

function wikiSearch(spotifyID, type){
    return new Promise((resolve, reject) => {
        //perform a wikidata query to try to find the page ids
        const endpoint = 'https://query.wikidata.org/sparql'
        
        var queryString
        switch(type){
            case 'artist':
                queryString = sparqlArtistQuery(spotifyID)
                break
            case 'album':
                queryString = sparqlAlbumQuery(spotifyID)
                break
            case 'song':
                queryString = sparqlSongQuery(spotifyID)
        }

        const url = endpoint + '?query=' + encodeURIComponent(queryString)
        const headers = {'Accept': 'application/sparql-results+json'}

        fetch(url, {headers: headers, method: 'GET'})
            .then(res => res.json())
            .then(json => {
                if(json.results.bindings.length == 0){
                    resolve(null)
                } else {
                    getWPName(json.results.bindings[0].itemLabel.value)
                        .then(WPName => resolve(WPName))
                        .catch(err => reject(err))
                }
            })
            // .then(WPName => resolve(WPName))
            .catch(err => reject(err))
        })
}

function getWPName(WDID){
    //get a wikipedia id from a wikidata id
    //TODO handle languages maybe
    return new Promise((resolve, reject) => {
        const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${WDID}&languages=en&props=sitelinks%2Furls&sitefilter=enwiki`

        fetch(url)
            .then(res => res.json())
            //dumbass string manipulation
            .then(json => resolve(json.entities[WDID].sitelinks.enwiki.url.replace('https://en.wikipedia.org/wiki/', '')))
            .catch(err => reject(err))
    })
}

//WIKIDATA SEARCH QUERY STRINGS
function sparqlArtistQuery(artistID){
    let queryString =
        `SELECT DISTINCT ?item ?itemLabel WHERE {SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }{SELECT DISTINCT ?item WHERE {?item p:P1902 ?statement0. ?statement0 (ps:P1902) "${artistID}".}LIMIT 1}}`
      return queryString

}

function sparqlAlbumQuery(albumID){
    let queryString = 
        `SELECT DISTINCT ?item ?itemLabel WHERE {SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }{SELECT DISTINCT ?item WHERE {?item p:P2205 ?statement0. ?statement0 (ps:P2205) "${albumID}".}LIMIT 100}}`
    return queryString;
}

function sparqlSongQuery(songID){
    let queryString = 
        `SELECT DISTINCT ?item ?itemLabel WHERE {SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }{SELECT DISTINCT ?item WHERE {?item p:P2207 ?statement0. ?statement0 (ps:P2207) "${songID}".}LIMIT 100}}`
    return queryString.replace();
}