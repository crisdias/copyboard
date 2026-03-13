// Minimal polyfill: wraps chrome.* callback APIs as promise-based browser.* APIs
// If browser.* already exists (Firefox), this is a no-op.
if (typeof globalThis.browser === 'undefined') {
  globalThis.browser = {
    storage: {
      local: {
        get(keys) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
              if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
              else resolve(result);
            });
          });
        },
        set(items) {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
              if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
              else resolve();
            });
          });
        }
      }
    },
    browserAction: {
      onClicked: chrome.browserAction
        ? chrome.browserAction.onClicked
        : { addListener() {} }
    },
    sidebarAction: null,
    runtime: chrome.runtime,
    windows: chrome.windows
      ? {
          create(opts) {
            return new Promise((resolve, reject) => {
              chrome.windows.create(opts, (win) => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(win);
              });
            });
          }
        }
      : null
  };
}
