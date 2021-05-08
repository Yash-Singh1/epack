// Declare StorageChange class: Defines the changes in the chrome.storage API’s StorageArea
class StorageChange {
  constructor(object) {
    for (const key of Object.keys(object)) {
      this[key] = object[key];
    }
  }
}

// Declare StorageArea class: Includes chrome.storage.sync and chrome.storage.local
// Note: This repo adds another key to the StorageArea class: type, defining the type of the StorageArea
class StorageArea {
  constructor(object) {
    for (const key of Object.keys(object)) {
      this[key] = object[key];
    }
  }
}

if (typeof decodeURIComponent(new URLSearchParams(window.location.search).get('panel')) === 'string') {
  /**
   * Parses the content if it is a string and isn’t empty
   * @param {*} content The content to parse
   * @returns {*} The parsed content
   */
  function parseJSON(content) {
    return typeof content === 'string' && content !== '' ? JSON.parse(content) : content;
  }

  // Read query parameters and parse the content
  const panelName = new URLSearchParams(window.location.search).get('panel');
  const renderedUnpack = unpack(parseJSON(localStorage.getItem('ide-' + panelName)), panelName);

  if (localStorage.getItem('preview-' + panelName) === null) {
    localStorage.setItem('preview-' + panelName, '{}');
  }

  chrome.runtime.sendMessage(localStorage.getItem('extensionid'), {method: 'INFO'}, null, (response) => {
    /**
     * Empty function used for default callback
     */
    function emptyFunction() {}

    /**
     * Writes to the preview storage for the panel
     * @param {string} key The key that should be set
     * @param {string} value The value that should be set
     */
    function writeToPreviewStorage(key, value) {
      let nowStorage = parseJSON(localStorage.getItem('preview-' + panelName));
      if (nowStorage === null || typeof nowStorage !== 'object') {
        nowStorage = {};
      }

      nowStorage[key] = value;
      localStorage.setItem('preview-' + panelName, JSON.stringify(nowStorage));
    }

    /**
     * Returns the preview storages content of the current panel
     * @returns {Object} The final value of the preview storage
     */
    function readPreviewStorage() {
      const nowStorage = parseJSON(localStorage.getItem('preview-' + panelName));
      if (nowStorage === null || typeof nowStorage !== 'object') {
        localStorage.setItem('preview-' + panelName);
        return {};
      }

      return nowStorage;
    }

    /**
     * Removes the given key from the storage
     * @param {string} key The key that should be removed
     */
    function removeFromPreviewStorage(key) {
      let nowStorage = parseJSON(localStorage.getItem('preview-' + panelName));
      if (nowStorage === null || typeof nowStorage !== 'object') {
        nowStorage = {};
      }

      nowStorage[key] = undefined;
      localStorage.setItem('preview-' + panelName, JSON.stringify(nowStorage));
    }

    /**
     * Clears the preview storage
     */
    function clearPreviewStorage() {
      localStorage.setItem('preview-' + panelName, '{}');
    }

    /**
     * Gets the bytes of the keys given from the preview storage, brought from {@link https://stackoverflow.com/a/57899756/13514657 StackOverflow Answer}
     * @param {String[]} arr The keys that should be used
     * @returns {number} The bytes in the string
     */
    function getBytes(array) {
      let nowStorage = parseJSON(localStorage.getItem('preview-' + panelName));
      if (nowStorage === null || typeof nowStorage !== 'object') {
        nowStorage = {};
        localStorage.setItem('preview-' + panelName, '{}');
      }

      nowStorage = Object.keys(nowStorage)
        .filter((key) => array.includes(key))
        .reduce((object, key) => {
          object[key] = nowStorage[key];
          return object;
        }, {});
      return new TextEncoder().encode(`"preview-${panelName}":${JSON.stringify(nowStorage)},`).length;
    }

    // The max properties for the sync StorageArea
    const maxes = {
      MAX_ITEMS: Number.POSITIVE_INFINITY,
      MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: Number.POSITIVE_INFINITY,
      MAX_WRITE_OPERATIONS_PER_HOUR: Number.POSITIVE_INFINITY,
      MAX_WRITE_OPERATIONS_PER_MINUTE: Number.POSITIVE_INFINITY
    };

    // The template for a StorageArea
    const storageAreas = {
      get: (keys, callback) => {
        if (typeof keys === 'string') {
          keys = [keys];
        }

        if (!Array.isArray(keys)) {
          keys = Object.keys(readPreviewStorage());
        }

        callback(
          Object.keys(readPreviewStorage())
            .filter((key) => keys.includes(key))
            .reduce((object, key) => {
              object[key] = readPreviewStorage()[key];
              return object;
            }, {})
        );
      },
      set(items, callback = emptyFunction) {
        for (const key of Object.keys(items)) {
          writeToPreviewStorage(key, items[key]);
        }
        callback();
      },
      clear: (callback = emptyFunction) => {
        clearPreviewStorage();
        callback();
      },
      remove: (keys, callback = emptyFunction) => {
        if (typeof keys === 'string') {
          keys = [keys];
        }

        if (!Array.isArray(keys)) {
          keys = Object.keys(readPreviewStorage());
        }

        for (const element of keys) {
          removeFromPreviewStorage(element);
        }
        callback();
      },
      getBytesInUse: (keys, callback) => {
        if (typeof keys === 'string') {
          keys = [keys];
        }

        if (!Array.isArray(keys)) {
          keys = Object.keys(readPreviewStorage());
        }

        callback(getBytes(keys));
      }
    };

    // Define chrome.devtools API
    chrome.devtools = {
      panels: {
        themeName: response.theme,
        SearchAction: {
          CancelSearch: 'cancelSearch',
          NextSearchResult: 'nextSearchResult',
          PerformSearch: 'performSearch',
          PreviousSearchResult: 'previousSearchResult'
        }
      },
      inspectedWindow: {
        /* eslint-disable-next-line no-eval */
        eval,
        reload: () => window.location.reload()
      },
      network: {}
    };

    // Define the chrome.extension API
    chrome.extension = {
      inIncognitoContext: response.inIncognito,
      getURL(path) {
        return 'chrome-extension://' + localStorage.getItem('extensionid') + '/' + path;
      }
    };

    // The NONE IDs
    chrome.tabs = {
      TAB_ID_NONE: response.tabNoneID
    };
    chrome.windows = {
      WINDOW_ID_NONE: response.windowNoneID
    };

    // Define the chrome.storage API using above templates and StorageArea class
    chrome.storage = {
      local: new StorageArea({...storageAreas, type: 'local'}),
      sync: new StorageArea({...storageAreas, ...maxes, type: 'sync'})
    };

    // Take all the information and start up the panel
    const htmlTemplate = `<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
`;
    document.querySelector('html').remove();
    if (typeof renderedUnpack.content === 'string') {
      document.write(renderedUnpack.content);
      if (!document.head) {
        document.querySelector('html').remove();
        document.write(htmlTemplate);
        document.write(renderedUnpack.content);
      }
    } else {
      document.write(htmlTemplate);
    }

    if (Array.isArray(renderedUnpack.styles)) {
      for (const styleElement of renderedUnpack.styles) {
        if (typeof styleElement === 'string') {
          const nextStyle = document.createElement('style');
          nextStyle.innerHTML = styleElement;
          document.head.append(nextStyle);
        }
      }
    }

    if (Array.isArray(renderedUnpack.scripts)) {
      for (const scriptElement of renderedUnpack.scripts) {
        if (typeof scriptElement === 'string') {
          const nextScript = document.createElement('script');
          nextScript.innerHTML = scriptElement;
          document.head.append(nextScript);
        }
      }
    }

    unpack = undefined;
  });
}
