/**
 * Gets a global setting
 * @param {string} setting The setting to get
 * @returns {any} The setting’s value
 */
function getGlobalSetting(setting) {
  return parseJSON(localStorage.getItem('settings')) ? parseJSON(localStorage.getItem('settings'))[setting] : globalTemplate[setting];
}

/* eslint-disable no-unused-vars */

/**
 * Sets the global setting
 * @param {string} query The key to set
 * @param {string} value The value to set the key to
 */
function setGlobalSetting /* eslint-enable no-unused-vars */(query, value) {
  let settingsJSON = parseJSON(localStorage.getItem('settings'));
  if (settingsJSON === null) {
    localStorage.setItem('settings', JSON.stringify(globalTemplate));
    settingsJSON = globalTemplate;
  }

  settingsJSON[query] = value;
  localStorage.setItem('settings', JSON.stringify(settingsJSON));
}

/**
 * Parses the content if it is a string and isn’t empty
 * @param {*} content The content to parse
 * @returns {*} The parsed content
 */
function parseJSON(content) {
  return typeof content === 'string' && content !== '' ? JSON.parse(content) : content;
}

/* eslint-disable no-unused-vars */

/**
 * Get the folding configuration that should be used right now
 */
function getFoldingConfig() {
  /* eslint-enable no-unused-vars */
  return getGlobalSetting('fold') ? {foldGutter: true, gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']} : {};
}

/**
 * Refreshes all editors
 */
function refreshAll() {
  for (const element of document.querySelectorAll(':root > body > #tabs > .tabcontent > .CodeMirror')) {
    element.CodeMirror.refresh();
  }
}

// Extend the ide.createTab function from monkeyide to also refresh all the tabs and editors
ide.createTab = (function () {
  const cachedFunction = ide.createTab;

  return function (...args) {
    const result = cachedFunction.apply(this, args);
    refreshAll();
    return result;
  };
})();

ide.openTab = (function () {
  const cachedFunction = ide.openTab;

  return function (...args) {
    const result = cachedFunction.apply(this, args);
    refreshAll();
    for (const element of document.querySelectorAll(':root > body > #tabs > .tabcontent > .CodeMirror')) {
      element.CodeMirror.setValue(element.CodeMirror.getValue());
    }
    return result;
  };
})();

/* eslint-disable no-unused-vars */

/**
 * Gets the current theme that should be used
 */
function getCurrentTheme() {
  /* eslint-enable no-unused-vars */
  return getGlobalSetting('theme') === 'dark' ? 'cobalt' : 'base16-light';
}
