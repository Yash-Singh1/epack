var once = false;

function getAndDoWelcome() {
  chrome.storage.sync.get(["welcome"], function (data) {
    if (data.welcome == undefined) {
      chrome.storage.sync.set({ welcome: "Welcome to MonkeyJS!" });
      setWelcomeLog("Welcome to MonkeyJS!");
    } else if (data.welcome == "" || data.welcome == null) {
      console.clear();
      if (welcomeElement() != null) {
        welcomeElement().remove();
      }
    } else {
      setWelcomeLog(data.welcome);
    }
  });
}

function setWelcomeLog(string) {
  if (once == true) {
    console.clear();
  } else {
    once = true;
  }
  if (welcomeElement() == null) {
    let newtag = document.createElement("p");
    newtag.id = "welcome";
    document.body.appendChild(newtag);
  }
  welcomeElement().innerHTML = string;
  console.log(string);
}

// getAndDoWelcome();
// setInterval(getAndDoWelcome, 5000);

let getFromStorage = () => {
  return new Promise((resolve, reject) =>
    chrome.storage.sync.get(null, (result) => {
      resolve(result);
    })
  );
};

function doInCurrentTab(tabCallback) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabArray) {
    tabCallback(tabArray[0]);
  });
}

chrome.runtime.onMessageExternal.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.method == "GET") {
    sendResponse(await getFromStorage());
  } else if (request.method == "SET") {
    chrome.storage.sync.set(request.body, function () {});
    sendResponse({ success: true });
  } else if (request.method == "INFO") {
    sendResponse({
      inIncognito: chrome.extension.inIncognitoContext,
      theme: (await getFromStorage()).devtoolsTheme,
      id: chrome.runtime.id,
    });
  }
});
