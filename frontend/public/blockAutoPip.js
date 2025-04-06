// This script directly blocks the autoPip.js functionality
(function() {
  console.log('[BlockAutoPip] Starting...');
  
  // Create a dummy module that does nothing
  const dummyAutoPip = {
    init: function() { 
      console.log('[BlockAutoPip] Prevented autoPip initialization');
      return this; 
    },
    enable: function() { return this; },
    disable: function() { return this; },
    toggle: function() { return this; },
    isPipSupported: function() { return false; },
    isPipAllowed: function() { return false; }
  };
  
  // Try to block 'autoPip' globally if it exists or is created later
  try {
    // Check if it already exists as a global
    if (window.autoPip) {
      console.log('[BlockAutoPip] Found existing autoPip, replacing with dummy');
      window.autoPip = dummyAutoPip;
    }
    
    // Define a getter/setter to replace it if someone tries to set it later
    Object.defineProperty(window, 'autoPip', {
      configurable: true,
      get: function() {
        console.log('[BlockAutoPip] Someone tried to access autoPip');
        return dummyAutoPip;
      },
      set: function() {
        console.log('[BlockAutoPip] Someone tried to set autoPip, blocking');
        return dummyAutoPip;
      }
    });
    
    // Also block 'enterPictureInPicture' and related properties
    ['enterPictureInPicture', 'enterpictureinpicture', 'requestPictureInPicture'].forEach(propName => {
      Object.defineProperty(window, propName, {
        configurable: true,
        get: function() {
          console.log(`[BlockAutoPip] Blocked access to ${propName}`);
          return function() { return Promise.resolve(); };
        },
        set: function() {
          console.log(`[BlockAutoPip] Blocked setting ${propName}`);
          return function() { return Promise.resolve(); };
        }
      });
    });
    
    console.log('[BlockAutoPip] Successfully installed blocking properties');
  } catch (e) {
    console.error('[BlockAutoPip] Error setting up blocking:', e);
  }
  
  // Intercept script loading to block autoPip.js
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Override the setter for the src attribute
      const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
      
      Object.defineProperty(element, 'src', {
        set: function(value) {
          if (typeof value === 'string' && (value.includes('autoPip') || value.includes('pip'))) {
            console.warn(`[BlockAutoPip] Blocking script load: ${value}`);
            // Set a dummy src instead
            return originalSrcSetter.call(this, 'data:text/javascript,console.log("[BlockAutoPip] Replaced script");');
          }
          return originalSrcSetter.call(this, value);
        },
        get: Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').get
      });
    }
    
    return element;
  };
  
  console.log('[BlockAutoPip] Ready to block autoPip.js');
})(); 