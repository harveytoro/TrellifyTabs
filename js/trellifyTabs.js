(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // TODO: Change to be configurable from options page
    const API_KEY = 'DEVELOPER_API_KEY_HERE';
    const AUTH_TOKEN = 'AUTH_TOKEN_HERE';
    const TRELLO_BOARD = 'BOARD_NAME_HERE';
    const TRELLO_LIST = 'LIST_NAME_HERE';

    // Set key and token on Trello object
    Trello.setKey(API_KEY);
    Trello.setToken(AUTH_TOKEN);

    // Trellify the tabs
    document.getElementById('btn-trellify').addEventListener('click', function() {

      var trellifyPromise;

      if (localStorage.list) {
        trellifyPromise = Promise.resolve(localStorage.list);
      }else {
        trellifyPromise = getListId();
      }

      trellifyPromise.then(function(listId) {
        var cardPromise = new Promise(function(toResolve, orReject) {
          Trello.post('cards', {
            name: $('#cardName').val(),
            idList: listId,
            due: null,
          }, toResolve);
        });

        var tabPromise = new Promise(function(toResolve, orReject) {
          chrome.tabs.query({
            windowId: chrome.windows.WINDOW_ID_CURRENT,
          }, toResolve);
        });

        return Promise.all([cardPromise, tabPromise]);
      }).then(function(cardTabArray) {
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
        chrome.tabs.remove(tabsToRemove);
      });
    });

    // Restore tabs
    var restorePromise;
    if (localStorage.list) {
      restorePromise = Promise.resolve(localStorage.list);
    }else {
      restorePromise = getListId();
    }

    restorePromise.then(function(listId) {
      return new Promise(function(toResolve, orReject) {
        Trello.get('lists/' + listId + '/cards?attachments=true', toResolve);
      });
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

    function getListId() {
      return new Promise(function(toResolve, orReject) {
        Trello.get('members/my/boards', toResolve);
      }).then(function(boards) {
        var boardId = '';
        for (var i = 0; i < boards.length; i++) {
          if (boards[i].name === TRELLO_BOARD) {
            boardId = boards[i].id;
            break;
          }
        }

        return new Promise(function(toResolve, orReject) {
          Trello.get('boards/' + boardId + '/lists', toResolve);
        });
      }, function(err) {

      }).then(function(lists) {
        var listId = '';
        for (var i = 0; i < lists.length; i++) {
          if (lists[i].name === TRELLO_LIST) {
            listId = lists[i].id;
            break;
          }
        }

        localStorage.list = listId;
        return listId;
      });
    }
  });
})();