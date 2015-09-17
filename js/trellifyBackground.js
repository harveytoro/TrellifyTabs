(function() {
  'use strict';
  chrome.runtime.onInstalled.addListener(function(data) {
    if (data.reason === 'install') {
      // Set API key to local storage
      localStorage.trellifyApiKey = 'DEVELOPER_API_KEY_HERE';

      var optionsPage = chrome.extension.getURL('html/page_options.html');
      chrome.tabs.create({url: optionsPage});
    }
  });
})();
