/* globals welcomeElement */

let once = false;

function getAndDoWelcome() {
  chrome.storage.sync.get(['welcome'], (data) => {
    if (data.welcome === undefined) {
      chrome.storage.sync.set({welcome: 'Welcome to epack!'});
      setWelcomeLog('Welcome to epack!');
    } else if (data.welcome === '' || data.welcome === null) {
      if (welcomeElement() !== null) {
        welcomeElement().remove();
      }
    } else {
      setWelcomeLog(data.welcome);
    }
  });
}

function setWelcomeLog(string) {
  if (once === true) {
    console.clear();
  } else {
    once = true;
  }

  if (welcomeElement() === null) {
    const newtag = document.createElement('p');
    newtag.id = 'welcome';
    document.body.append(newtag);
  }

  welcomeElement().innerHTML = string;
  console.log(string);
}

getAndDoWelcome();
setInterval(getAndDoWelcome, 5000);

const getFromStorage = () =>
  new Promise((resolve) => {
    chrome.storage.sync.get(null, (result) => {
      resolve(result);
    });
  });

/**
 * Listens for an external message from any site or extension
 * Does something based on the command:
 *  GET - Sends the storage
 *  SET - Sets the storage based on what was given
 *  INFO - Gives some information for the previewing of the panel, e.g. tab_id_none, theme name, incognito, etc.
 */
chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
  switch (request.method) {
    case 'GET':
      sendResponse(await getFromStorage());
      break;
    case 'SET':
      chrome.storage.sync.set(request.body, () => {});
      sendResponse({success: true});
      break;
    case 'INFO':
      sendResponse({
        inIncognito: chrome.extension.inIncognitoContext,
        theme: (await getFromStorage()).devtoolsTheme,
        id: chrome.runtime.id,
        tabNoneID: chrome.tabs.TAB_ID_NONE,
        windowNoneID: chrome.windows.WINDOW_ID_NONE,
        welcome: (await getFromStorage()).welcome
      });
      break;
    default:
      throw new Error(`Invalid cmd ${request.method}`);
  }
});
