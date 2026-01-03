
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CLEAN_ARTIST') {
    let artist = request.artist;
    
    if (artist && artist.includes('- Topic')) {
      artist = artist.replace(/\s*-\s*Topic\s*$/i, '');
      console.log('Cleaned artist:', artist);
      
      sendResponse({
        success: true,
        artist: artist
      });
    } else {
      sendResponse({
        success: false,
        artist: artist
      });
    }
  }

  if (request.type === 'SCROBBLE_DATA') {
    let { artist, track, album } = request;
    
    if (artist) {
      artist = artist.replace(/\s*-\s*Topic\s*$/i, '');
    }
    
    console.log('Scrobbling:', { artist, track, album });
    
    sendResponse({
      success: true,
      artist: artist,
      track: track,
      album: album
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method === 'POST' && details.url.includes('ws.audioscrobbler.com')) {
      if (details.requestBody && details.requestBody.formData) {
        const formData = details.requestBody.formData;
        
        if (formData['artist[0]']) {
          let artists = formData['artist[0]'];
          if (Array.isArray(artists)) {
            artists = artists.map(artist => {
              if (artist.includes('- Topic')) {
                console.log('Intercepted artist with Topic:', artist);
                return artist.replace(/\s*-\s*Topic\s*$/i, '');
              }
              return artist;
            });
            formData['artist[0]'] = artists;
            console.log('Modified artist:', artists);
          }
        }
      }
    }
  },
  { urls: ['https://ws.audioscrobbler.com/*'] },
  ['requestBody']
);

console.log('Last.fm YouTube Topic Remover initialized');


