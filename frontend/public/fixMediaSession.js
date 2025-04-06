// This script runs early to intercept and fix MediaSession API errors
(function() {
  console.log('[MediaSession Patcher] Initializing...');
  
  // Block autoPip.js completely by defining a fake module
  window.autoPip = {
    init: function() { 
      console.log('[MediaSession Patcher] Blocked autoPip initialization');
      return this; 
    },
    enable: function() { return this; },
    disable: function() { return this; },
    toggle: function() { return this; },
    isPipSupported: function() { return false; },
    isPipAllowed: function() { return false; }
  };
  
  // Block PiP methods on video elements
  try {
    if (HTMLVideoElement.prototype.requestPictureInPicture) {
      HTMLVideoElement.prototype.requestPictureInPicture = function() {
        console.log('[MediaSession Patcher] Blocked requestPictureInPicture call');
        return Promise.resolve();
      };
    }
  } catch (e) {
    console.warn('[MediaSession Patcher] Could not patch HTMLVideoElement:', e);
  }
  
  // Block the problematic Picture-in-Picture API
  if (document.pictureInPictureEnabled !== undefined) {
    Object.defineProperty(document, 'pictureInPictureEnabled', {
      get: function() { 
        console.log('[MediaSession Patcher] Blocked access to pictureInPictureEnabled');
        return false; 
      }
    });
  }
  
  // Fix MediaSession API errors
  if ('mediaSession' in navigator) {
    console.log('[MediaSession Patcher] Patching MediaSession API');
    
    // Store original method
    const originalSetActionHandler = navigator.mediaSession.setActionHandler;
    
    // Replace with safer version that blocks problematic actions
    navigator.mediaSession.setActionHandler = function(action, handler) {
      // List of valid actions only
      const validActions = [
        'play', 'pause', 'seekbackward', 'seekforward',
        'previoustrack', 'nexttrack', 'stop', 'seekto'
      ];
      
      // Explicitly block these problematic actions
      if (action === 'enterpictureinpicture' || 
          action === 'leavepictureinpicture' ||
          action === 'togglemicrophone' ||
          action === 'togglecamera') {
        console.warn(`[MediaSession Patcher] Blocked unsupported action: ${action}`);
        return;
      }
      
      // Only allow valid actions
      if (validActions.includes(action)) {
        try {
          return originalSetActionHandler.call(this, action, handler);
        } catch (e) {
          console.warn(`[MediaSession Patcher] Error setting action handler for ${action}:`, e);
        }
      } else {
        console.warn(`[MediaSession Patcher] Blocked invalid action: ${action}`);
      }
      
      return undefined;
    };
    
    // Initialize with basic metadata to avoid errors
    if (!navigator.mediaSession.metadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Interactive Podcast',
          artist: 'WildRec',
          album: 'Podcast',
          artwork: [{
            src: '/favicon.ico',
            sizes: '96x96',
            type: 'image/png'
          }]
        });
      } catch (e) {
        console.warn('[MediaSession Patcher] Error setting metadata:', e);
      }
    }
  }
  
  // Block known problematic scripts from loading
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
      if (originalSrcSetter) {
        Object.defineProperty(element, 'src', {
          set: function(value) {
            if (typeof value === 'string' && 
               (value.includes('autoPip') || 
                value.includes('pip') ||
                value.includes('picture-in-picture'))) {
              console.warn(`[MediaSession Patcher] Blocking script load: ${value}`);
              return originalSrcSetter.call(this, 'data:text/javascript,console.log("[MediaSession Patcher] Blocked script");');
            }
            return originalSrcSetter.call(this, value);
          },
          get: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').get
        });
      }
    }
    
    return element;
  };
  
  console.log('[MediaSession Patcher] MediaSession API fixes applied');
})(); 