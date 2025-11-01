let questflowWindowId = null;

chrome.action.onClicked.addListener(async (tab) => {
  // Check if the window is still open.
  if (questflowWindowId !== null) {
    try {
      const window = await chrome.windows.get(questflowWindowId);
      // If the window exists, focus it and return.
      chrome.windows.update(questflowWindowId, { focused: true });
      return;
    } catch (e) {
      // The window was closed by the user.
      questflowWindowId = null;
    }
  }

  // If the window doesn't exist, create a new one.
  chrome.windows.create({
    url: 'dashboard.html',
    type: 'popup',
    width: 410,
    height: 750,
  }, (window) => {
    questflowWindowId = window.id;
  });
});

// Listen for the window being closed by the user
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === questflowWindowId) {
    questflowWindowId = null;
  }
});