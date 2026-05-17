// Opens the side panel when the toolbar icon is clicked.

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {
      /* older Chrome: fall back to the onClicked handler below */
    });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
  }
});
