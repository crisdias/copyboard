// Background service worker for Chrome/Edge (Manifest V3)
// Opens the side panel when the extension icon is clicked

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

console.log('Copyboard service worker loaded');
