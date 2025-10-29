// Background script for the extension
// Manages sidebar opening

browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.open();
});

console.log('Copyboard background script loaded');
