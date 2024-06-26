chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['tasks', 'genres'], function (data) {
        if (!data.tasks) {
            chrome.storage.local.set({ tasks: [] });
        }
        if (!data.genres) {
            chrome.storage.local.set({ genres: ['ES', '適性検査', '面接'] });
        }
    });
});