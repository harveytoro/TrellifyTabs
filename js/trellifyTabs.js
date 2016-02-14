(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    if (!localStorage.trellifyToken || !localStorage.trellifyApiKey) {
      $('#container').html('<p>ERROR: Token and/or API key missing.</p>');
      return;
    } else if (!localStorage.trellifyListId) {
      $('#container').html('<p>ERROR: No List has been set. Please go to options to set this.</p>');
      return;
    }
    
    
    if(localStorage.trellifyDisableTrellify == "true") {
      $('.trellifying').hide();
    }
    
    if(localStorage.trellifyDisableBookmarking == "true") {
     // $('body').css('width','400px');
      $('.bookmarking').hide();
    }
    
    

    // Set key and token on Trello object
    Trello.setKey(localStorage.trellifyApiKey);
    Trello.setToken(localStorage.trellifyToken);

    // Trellify the tabs
    document.getElementById('btn-trellify').addEventListener('click', function() {

      var cardPromise = new Promise(function(toResolve, orReject) {
        Trello.post('cards', {
          name: $('#cardName').val(),
          idList: localStorage.trellifyListId,
          due: null,
        }, toResolve);
      });

      var tabPromise = new Promise(function(toResolve, orReject) {
        chrome.tabs.query({
          windowId: chrome.windows.WINDOW_ID_CURRENT,
        }, toResolve);
      });

      Promise.all([cardPromise, tabPromise]).then(function(cardTabArray) {
        var cardId = cardTabArray[0].id;
        var tabs = cardTabArray[1];
        var attachmentPromises = [];
        var removeTabs = [];

        attachmentPromises.push(Promise.resolve(cardTabArray[0].shortUrl));
        for (var i = 0; i < tabs.length; i++) {
          attachmentPromises.push(new Promise(function(toResolve, orReject) {
            Trello.post('cards/' + cardId + '/attachments', {
              url: tabs[i].url,
              name: tabs[i].title,
            }, toResolve);
          }));

          removeTabs.push(tabs[i].id);
        }

        attachmentPromises.push(Promise.resolve(removeTabs));
        return Promise.all(attachmentPromises);
      }).then(function(values) {
        var cardShortUrl = values[0];
        var tabsToRemove = values[values.length - 1];
        chrome.tabs.create({  url: cardShortUrl, });
        if (localStorage.trellifyTabClose  == "true"){
          chrome.tabs.remove(tabsToRemove);
        }
      });
    });

    // Restore tabs
    var restorePromise = new Promise(function(toResolve, orReject) {
        Trello.get('lists/' + localStorage.trellifyListId + '/cards?attachments=true', toResolve);
      }).then(function(cards) {
      if (cards.length === 0) {
        $('#restore-cards').append('<option>None to restore</option>');
      }

      for (var i = 0; i < cards.length; i++) {
        var url = [];
        for (var j = 0; j < cards[i].attachments.length; j++) {
          url.push(cards[i].attachments[j].url);
        }

        if (url.length !== 0) {
          $('#restore-cards').append('<option data-card=' +
           JSON.stringify(url) +
           '>' + cards[i].name +
           ' - ' +
           cards[i].attachments.length +
           '</option>');
        }
      }

      document.getElementById('loading-option').remove();
    });

    document.getElementById('btn-restore').addEventListener('click', function() {
      var urls = JSON.parse(document.getElementById('restore-cards').options[document.getElementById('restore-cards').selectedIndex].dataset.card);

      for (var i = 0; i < urls.length; i++) {
        chrome.tabs.create({
          url: urls[i],
        });
      }
    });

    var listPromise = new Promise(function(toResolve, orReject){
      Trello.get('/boards/' + localStorage.trellifyBoardId + '/lists', toResolve);
    }).then(function(lists){

      for(var i = 0; i < lists.length; i++) {
        $('#cardListBookmark').append('<option data-list='+  lists[i].id + '>' + lists[i].name + '</option>');
      }

      document.getElementById('loading-option-bookmark').remove();
    });

    document.getElementById('btn-bookmark').addEventListener('click', function() {
      var currentTabPromise = new Promise(function(toResolve, orReject){
        chrome.tabs.query({
          active: true,
          currentWindow: true,
        }, toResolve);
      }).then(function(tabArray){
        var listId = document.getElementById('cardListBookmark').options[document.getElementById('cardListBookmark').selectedIndex].dataset.list;
        var label = document.getElementById('boardLabels').options[document.getElementById('boardLabels').selectedIndex].dataset.label;
        var labelId = (label == "None")? null: label;
        Trello.post('cards', {
          name: $('#cardNameBookmark').val().length != 0 ? $('#cardNameBookmark').val() : tabArray[0].title,
          idList: listId,
          idLabels: labelId, 
          due: null,
          urlSource: tabArray[0].url
        }, function(){
          window.close();
        });
      });
    });
    
    
    var labelPromise = new Promise(function(toResolve, orReject){
      Trello.get('/boards/' + localStorage.trellifyBoardId + '/labels', toResolve);
    }).then(function(labels){
      for(var i = 0; i < labels.length; i++) {
        $('#boardLabels').append('<option data-label='+  labels[i].id + '>' + labels[i].name + '</option>');
      }
    });
  });
})();
