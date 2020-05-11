planner.onclick = function(element) {
    chrome.storage.sync.get(['serverurl'], function(items) {
        console.log(items)
        if ('serverurl' in items) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {code: "window.location.href = '"+items.serverurl+"/planner'"});
                window.close();
            });
        }
    });
};

weekplanner.onclick = function(element) {
    chrome.storage.sync.get(['serverurl'], function(items) {
        console.log(items)
        if ('serverurl' in items) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {code: "window.location.href = '"+items.serverurl+"/planner/week'"});
                window.close();
            });
        }
    });
};

options.onclick = function(element) {
    chrome.runtime.openOptionsPage();
};

