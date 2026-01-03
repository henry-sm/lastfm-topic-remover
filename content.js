console.log('Last.fm Topic Remover loaded on:', window.location.href);

const script = document.createElement('script');
script.textContent = `
(function() {
  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...args]);
  };
  
  XMLHttpRequest.prototype.send = function(body) {
    if (this._url && typeof this._url === 'string' && this._url.includes('ws.audioscrobbler.com')) {
      if (body && typeof body === 'string') {
        try {
          const params = new URLSearchParams(body);
          let artist = params.get('artist[0]');
          
          if (artist && artist.includes('- Topic')) {
            artist = artist.replace(/\\s*-\\s*Topic\\s*$/i, '');
            params.set('artist[0]', artist);
            body = params.toString();
            console.log('XHR artist cleaned before scrobbling:', artist);
          }
        } catch (e) {
          console.error('Error cleaning XHR:', e);
        }
      }
    }
    return originalSend.apply(this, [body]);
  };
  
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const config = args[1] || {};

    if (typeof url === 'string' && url.includes('ws.audioscrobbler.com')) {
      if (config.body) {
        try {
          const params = new URLSearchParams(config.body);
          let artist = params.get('artist[0]');
          
          if (artist && artist.includes('- Topic')) {
            artist = artist.replace(/\\s*-\\s*Topic\\s*$/i, '');
            params.set('artist[0]', artist);
            config.body = params.toString();
            console.log('Fetch artist cleaned before scrobbling:', artist);
          }
        } catch (e) {
          console.error('Error cleaning fetch:', e);
        }
      }
    }

    return originalFetch.apply(this, [url, config]);
  };
})();
`;

(document.head || document.documentElement).appendChild(script);
script.remove();


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_INFO') {
    const pageTitle = document.title;
    sendResponse({
      title: pageTitle,
      url: window.location.href
    });
  }
});

chrome.runtime.sendMessage({
  type: 'PAGE_LOADED',
  url: window.location.href,
  title: document.title
}).catch(err => {
});
