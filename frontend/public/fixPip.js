// Fix for Picture-in-Picture Media Session API error
(function() {
  // The original error is about 'enterpictureinpicture' not being a valid MediaSession action
  // Let's patch the MediaSession API to safely handle this case
  if ('mediaSession' in navigator) {
    const originalSetActionHandler = navigator.mediaSession.setActionHandler;
    
    // Replace with a safe version that checks validity of actions
    navigator.mediaSession.setActionHandler = function(action, handler) {
      // List of valid MediaSession actions as of 2023
      const validActions = [
        'play', 'pause', 'seekbackward', 'seekforward',
        'previoustrack', 'nexttrack', 'stop', 'seekto',
        'skipad', 'togglemicrophone', 'togglecamera'
      ];
      
      // Only call the original method for valid actions
      if (validActions.includes(action)) {
        return originalSetActionHandler.call(this, action, handler);
      } else {
        console.warn(`Ignored invalid MediaSession action: ${action}`);
        return undefined;
      }
    };
    
    // Set a placeholder metadata if none exists
    if (!navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Podcast',
        artist: 'Interactive Player',
        album: 'WildRec',
        artwork: [{
          src: '/favicon.ico',
          sizes: '96x96',
          type: 'image/png'
        }]
      });
    }
  }
})(); 