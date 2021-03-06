(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // Set key and token on Trello object
    Trello.setKey(localStorage.trellifyApiKey);

    Trello.authorize({
      interactive: false,
      success: authorizedState,
    });

    // Trellify the tabs
    document.getElementById('btn-token').addEventListener('click', function() {
      if (localStorage.getItem('trello_token') !== null) {
        Trello.deauthorize();
        authorizedState();
      } else {
        Trello.authorize({
          type: 'redirect',
          success: authorizedState,
          interactive: true,
          name: 'TrellifyTabs',
          expiration: 'never',
          scope: { write: true, read: true },
        });
      }
    });

    document.getElementById('btn-authOptions').addEventListener('click', function() {
      var boardId = $('#board-names :selected').val();
      var listName = $('#inp-listName').val();
      var listNames =  new Promise(function(toResolve, orReject) {
        Trello.get('boards/' + boardId + '/lists', toResolve);
      }).then(function(lists) {
        for (var i = 0; i < lists.length; i++) {
          if (lists[i].name === listName) {
            return Promise.resolve(lists[i].id);
          }
        }

        return new Promise(function(toResolve, orReject) {
          Trello.post('boards/' + boardId + '/lists', {name: listName}, toResolve);
        });
      }).then(function(list) {
        localStorage.trellifyListId = (typeof list === 'string') ? list : list.id;
        localStorage.trellifyListName = listName;
        localStorage.trellifyBoardId = boardId;
        localStorage.trellifyTabClose = $('#inp-closeTab').is(':checked');
        localStorage.trellifyDisableTrellify = $('#inp-disableTrellify').is(':checked')
        localStorage.trellifyDisableBookmarking = $('#inp-disableBookmarking').is(':checked');
        localStorage.trellifyDisableLabel = $('#inp-disableLabel').is(':checked');
        $('.updateMsg').css("display","block");
        setTimeout(function() {
            $('.updateMsg').css("display","none");
        }, 2000);
      });
    });

    function populateBoardNames() {
      var boardN =  new Promise(function(toResolve, orReject) {
        Trello.get('members/my/boards', toResolve);
      }).then(function(boards) {
        for (var i = 0; i < boards.length; i++) {
          if (boards[i].closed) continue;
          var name =  boards[i].name.length > 20 ? boards[i].name.substr(0, 20) + '...' : boards[i].name;

          var selected = "";
          if(boards[i].id == localStorage.trellifyBoardId){
            selected = "selected";
          }

          $('#board-names').append('<option ' + selected + ' value="' + boards[i].id + '">' + name + '</option>');
        }
        $('#inp-listName').val(localStorage.trellifyListName);
      });
    }

    function authorizedState() {
      if (localStorage.getItem('trello_token') !== null) {
        localStorage.trellifyToken = localStorage.getItem('trello_token');
        $('#btn-token').text('Deauthorize Trello');
        $('#btn-token').removeClass('btn-success').addClass('btn-warning');
        $('#authorizedOnly').removeClass('hidden');
        populateBoardNames();
        
        if(localStorage.trellifyTabClose == "true"){
          $('#inp-closeTab').prop('checked', true);
        }
        
        if(localStorage.trellifyDisableTrellify == "true"){
          $('#inp-disableTrellify').prop('checked', true);
        }
        if(localStorage.trellifyDisableBookmarking == "true"){
          $('#inp-disableBookmarking').prop('checked', true);
        }
        
        if(localStorage.trellifyDisableLabel == "true"){
          $('#inp-disableLabel').prop('checked', true);
        }

      } else {
        localStorage.removeItem('trellifyToken');
        $('#btn-token').text('Authorize Trello');
        $('#btn-token').removeClass('btn-warning').addClass('btn-success');
        $('#authorizedOnly').addClass('hidden');
      }
    }
  });
})();
