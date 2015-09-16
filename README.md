# Trellify Tabs

**Chrome extension to save tabs to [Trello](https://trello.com) and then restore tabs**

Not quite ready to be put in the chrome app store

## TODO
- [ ] Add options page
  - [ ] To allow configuration of board and list that the tab cards are be added to
  - [ ] To go through auth flow and save in local storage
  - [ ] To give ability to leave tabs open when trellified
  - [ ] Currently limited to the current Chrome window, this could be optional
- [ ] Check that a name for the tab set has been given or auto populate with date / time
## Usage

To use the extension in the current form.

Download the source

Run bower
```bash
bower install
```

Modify trellifyTabs.js

```javascript
const API_KEY = 'DEVELOPER_API_KEY_HERE';
const AUTH_TOKEN = 'AUTH_TOKEN_HERE';
const TRELLO_BOARD = 'BOARD_NAME_HERE';
const TRELLO_LIST = 'LIST_NAME_HERE';
```

To get a trello developer API key go [here](https://trello.com/app-key)

Using your API key you can generate a token by navigating here:
```code
https://trello.com/1/authorize?response_type=token&key=API_KEY_HERE&scope=read%2Cwrite&expiration=never&name=TrellifyTabs
```

Add the name of the board and list where you would like the extension to save the link cards.
For a given set of tabs when you trellify the tabs a new card is created with the name supplied in the extension popup and then link attachments are added to the card for each tab URL.

Go to chrome://extensions in Chrome with developer mode ticked click load unpacked extension and navigate to the TrellifyTabs directory.
