(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // Set key and token on Trello object
    Trello.setKey(localStorage.trellifyApiKey);

    authorizedState();

    Trello.authorize({
      interactive:false,
      success: authorizedState,
    });

    // Trellify the tabs
    document.getElementById('btn-token').addEventListener('click', function() {
      if (localStorage.trello_token) {
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

    function authorizedState(){
      if (localStorage.trello_token) {
        localStorage.trellifyToken = localStorage.trello_token;
        $('#btn-token').text('Deauthorize Trello');
        $('#btn-token').removeClass('btn-success').addClass('btn-warning');
      } else {
        localStorage.removeItem('trellifyToken');
        $('#btn-token').text('Authorize Trello');
        $('#btn-token').removeClass('btn-warning').addClass('btn-success');
      }
    }
  });
})();
