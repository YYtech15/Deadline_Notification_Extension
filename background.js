chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ tasks: [] }, () => {
        console.log("Initial tasks array set");
    });
});