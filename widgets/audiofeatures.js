module.exports.build = function(app, spotifyAPI, args, callback){
    spotifyAPI.getAudioFeaturesForTrack(args.song.id)
        .then((data) => {
            //remove unwanted fields
            delete data.body.type
            delete data.body.id
            delete data.body.uri
            delete data.body.track_href
            delete data.body.analysis_url

            //change any fields that need to be changed
            data.body.duration = data.body.duration_ms / 1000 + " seconds"
            delete data.body.duration_ms

            data.body.key = pitchClassToNoteString(data.body.key)

            const tooltips = {
                "acousticness": "A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.",
                "danceability": "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.",
                "energy": "Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.",
                "instrumentalness": "Instrumentalness predicts whether a track contains no vocals. 'Ooh' and 'aah' sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly 'vocal'. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.",
                "liveness": "Liveness detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.",
                "loudness": "The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.",
                "mode": "Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.",
                "speechiness": "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.",
                "tempo": "The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.",
                "valence": "Valence is a measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry)."
            }

            

            app.render('../widgets/views/audiofeatures.pug', {data: data, tooltips: tooltips}, (err, html) => {
                if(err){
                    console.log(err)
                    callback('')
                }
                callback(html)
            })
        })
}

function pitchClassToNoteString(pitchclass){
    //return a note string from a standard pitch class notation
    var ret = pitchclass
    switch(pitchclass){
        case 0:
            ret = 'C'
            break
        case 1:
            ret = 'C♯/D♭'
            break
        case 2:
            ret = 'D'
            break
        case 3:
            ret = 'D♯/E♭'
            break
        case 4:
            ret = 'E'
            break
        case 5:
            ret = 'F'
            break
        case 6:
            ret = 'F♯/G♭'
            break
        case 7:
            ret = 'G'
            break
        case 8:
            ret = 'G♯/A♭'
            break
        case 9:
            ret = 'A'
            break
        case 10:
            ret = 'A♯/B♭'
            break
        case 11:
            ret = 'B'
    }
    return ret
}