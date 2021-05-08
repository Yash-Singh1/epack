// #region Panel Manipulation Functions

/**
 * Creates a template
 * @param {Object} target The template that was brought from the server
 */
function runTemplate(target) {
  if (!parseJSON(handleNull('total', true)).includes(target.title)) {
    localStorage.setItem(
      'ide-' + target.title,
      JSON.stringify({
        settings: target.settings,
        tabs: []
      })
    );
    const total = parseJSON(handleNull('total', true));
    total.push(target.title);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + target.title);
    ide.large(
      target.tabs.map((tab) => ({
        name: tab.name,
        configuration: {
          ...tab.configuration,
          lineNumbers: getGlobalSetting('lineNumbers'),
          lineWrapping: getGlobalSetting('lineWrapping'),
          theme: getCurrentTheme(),
          ...getFoldingConfig()
        }
      }))
    );
    localStorage.setItem('ide-' + target.title, stringifiedPack(target.title));
    ide.openTab(0);
    notNullAnymore();
  }
}

/**
 * Packs up the files so it can be pushed into the localStorage
 * @param {Object} query The ide.files from the monkeyide project
 */
function stringifiedPack(query) {
  return JSON.stringify({
    tabs: JSON.stringify(ide.pack(ide.files)),
    settings: parseJSON(handleNull('ide-' + query)).settings
  });
}

/**
 * A function to switch the current panel
 * @param {string} current The current panel
 * @param {string} newer The newer panel
 */
ide.switchPanel = function (current, newer) {
  if (current !== null) {
    localStorage.setItem(current, stringifiedPack(current.slice(4)));
  }
  localStorage.setItem('current', newer);
  ide.removeAll();
  ide.large(parseJSON(parseJSON(handleNull(newer)).tabs));
  ide.currentPanel = newer;
  byId('current-panel').innerHTML = newer.slice(4);
  notNullAnymore();
};

// #endregion

// #region IDE Functions

/**
 * Resizes all tabs to required sizes
 */
function resizeTabs() {
  for (const element of document.querySelectorAll(':root > body > #tabs > .tabcontent > .CodeMirror')) {
    element.CodeMirror.setSize(...sizes);
  }
}

// #endregion

// #region Theming Functions

/**
 * Start up dark mode
 */
function startDarkMode() {
  if (darkModeOn === false) {
    DarkReader.enable(
      {
        contrast: 90
      },
      {
        invert: [
          '#switch',
          '#duplicate',
          '#settings',
          '#info',
          '#blankPNG',
          '#styles-label',
          '#scripts-label',
          '#panelSettings',
          '#globalSettings',
          'label[for="panelData"]',
          'label[for="includehtml"]',
          '#duplicateName',
          '#name',
          '#duplicateName:-webkit-autofill',
          '#name:-webkit-autofill',
          '.loader',
          '#sureHeader'
        ],
        css: [
          'body, html {',
          '  background-color: var(--darkreader-neutral-background) !important;',
          '}',
          '',
          '#duplicateName:-webkit-autofill, #name:-webkit-autofill {',
          '  filter: invert(0%) !important;',
          '}',
          ''
        ].join('\n')
      }
    );
    setAllThemes('cobalt');
    darkModeOn = true;
    if (!document.body.classList.contains('dark')) {
      document.body.classList.add('dark');
    }
  }
}

/**
 * Turn off dark mode
 */
function turnOffDarkMode() {
  if (darkModeOn === true) {
    DarkReader.disable();
    setAllThemes('base16-light');
    darkModeOn = false;
    if (document.body.classList.contains('dark')) {
      document.body.classList.remove('dark');
    }
  }
}

/**
 * Sets the theme in all open editors
 * @param {string} theme The theme to set it to
 */
function setAllThemes(theme) {
  if (!ide.currentPanel) {
    return;
  }

  setAllConfig('theme', theme);
  for (item of ide.tabsElements.children) {
    if ([...item.classList].find((value) => value.startsWith('cm-s-'))) {
      item.classList.replace(
        [...item.classList].find((value) => value.startsWith('cm-s-')),
        `cm-s-${theme}`
      );
    }
  }
}

/**
 * Decide based on the set theme
 * @param {string} theme The theme to decide based on
 */
function decideTheme(theme) {
  setGlobalSetting('theme', theme);
  switch (theme) {
    case 'dark':
      startDarkMode();
      break;
    case 'light':
      turnOffDarkMode();
      break;
    case 'auto':
      viewAutoResults(matchMedia(darkMediaQuery).matches);
  }
}

/**
 * Based on whether the prefers-color-scheme matches, turns on or off dark mode
 * @param {boolean} matches Whether dark mode is prefered
 */
function viewAutoResults(matches) {
  if (matches) {
    startDarkMode();
  } else {
    turnOffDarkMode();
  }
}

// #endregion

// #region Local Settings Functions

/**
 * Sets a local setting
 * @param {string} panelName The panel name of that setting
 * @param {string} query The key of the setting
 * @param {string} value The value to set the setting to
 */
function setLocalSetting(panelName, query, value) {
  const nowSettings = parseJSON(parseJSON(localStorage.getItem(panelName)).settings);
  nowSettings[query] = value;
  localStorage.setItem(
    panelName,
    JSON.stringify({
      tabs: parseJSON(parseJSON(localStorage.getItem(panelName)).tabs),
      settings: nowSettings
    })
  );
}

/**
 * Gets a local setting
 * @param {string} panelName The name of the panel
 * @param {string} query The name of the setting
 * @returns {any} The setting’s final value
 */
function getLocalSetting(panelName, query) {
  return parseJSON(localStorage.getItem(panelName)).settings[query]
    ? parseJSON(localStorage.getItem(panelName)).settings[query]
    : globalTemplate[query];
}

/**
 * Set all configurations in all tabs and panels
 * @param {string} configName The name of the configuration
 * @param {*} valueToSet The value to set the config to
 * @param {Function} [filterCallback] An optional filtering callback
 */
function setAllConfig(configName, valueToSet, filterCallback) {
  if (!ide.currentPanel) {
    return;
  }

  for (const value of parseJSON(handleNull('total', true))) {
    const parsedValue = parseJSON(handleNull(`ide-${value}`));
    let tabsOfPanel = parseJSON(parsedValue.tabs);
    tabsOfPanel = filterCallback ? tabsOfPanel.filter(filterCallback) : tabsOfPanel;
    tabsOfPanel = tabsOfPanel.map((value) => {
      value.configuration[configName] = valueToSet;
      return value;
    });
    parsedValue.tabs = JSON.stringify(tabsOfPanel);
    localStorage.setItem(`ide-${value}`, JSON.stringify(parsedValue));
  }
  let topSelected = [...document.querySelectorAll('body > #tabs > .tabcontent > .CodeMirror')];
  if (document.querySelector('iframe') !== null) {
    for (let frame of [...document.querySelectorAll('iframe')]) {
      if (!frame || !frame.contentDocument) {
        continue;
      }

      frame = frame.contentDocument;
      if (frame.querySelector('.tabcontent') !== null) {
        topSelected = [...topSelected, ...frame.querySelectorAll('body > #tabs > .tabcontent > .CodeMirror')];
      }
    }
  }

  for (const element of topSelected.filter((...arguments_) => {
    arguments_[0] = ide.getTab(arguments_[0].parentElement.id.slice(4)).name;
    arguments_[2] = arguments_[2].map((value) => ide.getTab(value.parentElement.id.slice(4)).name);
    return filterCallback ? filterCallback(arguments_) : true;
  })) {
    element.CodeMirror.setOption(configName, valueToSet);
  }
}

/**
 * Set all folding configuration
 * @param {boolean} enable Enable or disable it
 */
function setFoldingConfig(enable) {
  setAllConfig('foldGutter', enable);
  setGlobalSetting('fold', enable);
  setAllConfig('gutters', enable ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'] : undefined);
}

// #endregion

// #region Storage Functions

/**
 * Gets the bytes of a preview panel’s storage
 * @param {String[]} [arr] The keys that should be used inside the call
 * @param {boolean} preview Whether the preview storage is examined or not
 */
function getBytes(array, preview) {
  const prefix = preview ? 'preview-' : 'ide-';
  let nowStorage = parseJSON(localStorage.getItem(prefix + panelName));
  if (nowStorage === null || typeof nowStorage !== 'object') {
    nowStorage = {};
    localStorage.setItem(prefix + panelName, '{}');
  }

  if (!array) {
    array = Object.keys(nowStorage);
  }

  nowStorage = Object.keys(nowStorage)
    .filter((key) => array.includes(key))
    .reduce((object, key) => {
      object[key] = nowStorage[key];
      return object;
    }, {});
  return new TextEncoder().encode(`"${prefix}${panelName}":${JSON.stringify(nowStorage)},`).length;
}

/**
 * Put the info in the info message
 * @param {string} panel The panel name to describe
 */
function switchInfoMessage(panel) {
  panelName = panel.slice(4);

  const bytes = humanFormat.bytes(getBytes(undefined, true));
  const mainBytes = humanFormat.bytes(getBytes(undefined, false));
  const tabs = parseJSON(parseJSON(localStorage.getItem(panel)).tabs);

  byId('info-dialog').innerHTML = `Information:
<br />
&emsp;Main storage bytes: ${mainBytes}
<br />
&emsp;Preview storage bytes: ${bytes}
<br />
&emsp;Panel name: ${panel.slice(4)}
<br />
&emsp;Styles: ${tabs.filter((value) => value.name.includes('STYLE')).length}
<br />
&emsp;Scripts: ${tabs.filter((value) => value.name.includes('SCRIPT')).length}`;
}

/**
 * Handles if the localStorage query was null
 * @param {string} item The item that should be queried
 * @param {boolean} list Whether the item will be a list or not
 * @returns {*} The ended up result from the localStorage
 */
function handleNull(item, list) {
  if (localStorage.getItem(item) === null || localStorage.getItem(item) === '') {
    const toReturn = list === true ? '[]' : JSON.stringify({settings: {}, tabs: []});
    localStorage.setItem(item, toReturn);
    return toReturn;
  }

  return localStorage.getItem(item);
}

function removeFromTotal(...keys) {
  const totally = parseJSON(handleNull('total', true));
  const futureTotally = [];
  for (const element of totally) {
    if (!keys.includes(element)) {
      futureTotally.push(element);
    }
  }

  localStorage.setItem('total', JSON.stringify(futureTotally));
}

// #endregion

// #region DOM Functions

/**
 * Selects an element by ID
 * @param {string} id The ID of the element
 */
function byId(id) {
  return document.getElementById(id);
}

/**
 * Creates multiple checkboxes through the 'total' item in the localStorage
 * @param {boolean} allChecked Whether all of the checkboxes should be checked
 * @returns {string} The innerHTML that should be used
 */
function constructBoxes(allChecked) {
  let returnString = '';
  checkedAtrribute = '';
  if (allChecked === true) {
    checkedAtrribute = ' checked';
  }

  for (let panelID = 0; panelID < parseJSON(handleNull('total', true)).length; panelID += 1) {
    const element = parseJSON(handleNull('total', true))[panelID];
    returnString +=
      '<input id="checkbox-' +
      element +
      '" type="checkbox" name="' +
      element +
      '"' +
      checkedAtrribute +
      '>' +
      '<label for="checkbox-' +
      element +
      '">' +
      element +
      '</label><br>';
  }

  return returnString;
}

/**
 * Runs on the Settings > Global Settings > Danger Zone > Clear
 */
function areYouSureClear() {
  areyousure = (sure) => {
    if (sure) {
      const remID = localStorage.getItem('extensionid');
      localStorage.clear();
      localStorage.setItem('extensionid', remID);
      location.reload();
    }
  };
  showIt(byId('sureOrNot'));
}

/**
 * Runs on Settings > Panel Settings > Danger Zone > Convert to Sidebar
 */
function areYouSureConvertToSidebar() {
  areyousure = (sure) => {
    if (sure) {
      setLocalSetting(ide.currentPanel, 'type', 'sidebar');
      setLocalSetting(ide.currentPanel, 'matches', ['elementsPanel', 'sourcesPanel']);
      setLocalSetting(ide.currentPanel, 'height', 'default');
      setLocalSetting(ide.currentPanel, 'width', 'default');
    }
  };
  showIt(byId('sureOrNot'));
}

/**
 * Runs on Settings > Panel Settings > Danger Zone > Convert to Panel
 */
function areYouSureConvertToPanel() {
  areyousure = (sure) => {
    if (sure) {
      setLocalSetting(ide.currentPanel, 'type', 'panel');
      setLocalSetting(ide.currentPanel, 'matches');
      setLocalSetting(ide.currentPanel, 'height');
      setLocalSetting(ide.currentPanel, 'width');
    }
  };
  showIt(byId('sureOrNot'));
}

/**
 * Shows a dialog modal
 * @param {HTMLDialogElement} modal The modal
 */
function showIt(modal) {
  if (typeof modal.showModal === 'function') {
    return modal.showModal();
  }
  /* eslint-disable-next-line no-alert */
  alert('The <dialog> API is not supported by this browser');
}

/**
 * Enables the element
 * @param {HTMLElement} el The element to enable
 * @param {boolean} [inline=false] Whether the display should be inline
 */
function enable(element, inline = false) {
  element.style.display = inline ? 'inline' : 'block';
  element.style.pointerEvents = 'initial';
}

/**
 * Disables an element
 * @param {HTMLElement} el The element to disable
 */
function disable(element) {
  element.style.display = 'none';
  element.style.pointerEvents = 'none';
}

/**
 * Runs when a new panel is created or it is sure that there is some tabs on the screen
 */
function notNullAnymore() {
  switchInfoMessage(ide.currentPanel);
  resizeTabs();
  refreshAll();
  enable(byId('current-panel-wrapper'));
  enable(document.querySelector('.tabbuttons'));
  enable(byId('tabs'));
  enable(byId('switch'));
  enable(byId('save'));
  enable(byId('deploy'));
  enable(byId('delete'));
  enable(byId('duplicate'));
  enable(byId('preview-panel'));
  enable(byId('info'), true);
  disable(byId('msgStart'));
  byId('settings').style.right = '';
  byId('preview-panel').href = '/preview-panel.html?panel=' + ide.currentPanel.slice(4);
}

/**
 * Runs when there is nothing on the screen
 */
function nullAgain() {
  disable(byId('current-panel-wrapper'));
  disable(document.querySelector('.tabbuttons'));
  disable(byId('tabs'));
  disable(byId('switch'));
  disable(byId('save'));
  disable(byId('deploy'));
  disable(byId('delete'));
  disable(byId('duplicate'));
  disable(byId('preview-panel'));
  disable(byId('info'));
  enable(byId('msgStart'));
  byId('settings').style.right = '26px';
  localStorage.removeItem('current');
  ide.currentPanel = null;
  byId('preview-panel').removeAttribute('href');
  byId('info-dialog').innerHTML = 'Information:<br />There isn’t any panel open';
}

// #endregion

// #region Miscellaneous Helper Functions

/**
 * Easier way of sending request, based on https://stackoverflow.com/a/30008115/13514657
 * @param {string} method The method of the request
 * @param {string} url The URL to send the request
 * @param {Object} [data] The data sent with the request
 */
function makeRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.addEventListener('load', function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    });

    xhr.addEventListener('error', function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    });

    if (!['GET', 'HEAD'].includes(method) && data) {
      xhr.send(data);
    } else {
      xhr.send();
    }
  });
}

// #endregion

// #region Initialize Variables

// Buttons, dialogs, and inputs
const createBlankDialog = byId('createBlankDialog');
const createValid = byId('status');
const nameOfPanel = byId('name');
const duplicateName = byId('duplicateName');
const createBlankButton = byId('createBlankBtn');
const confirmSwitchButton = byId('confirmSwitchBtn');
const otherDialog = byId('switchDialog');
const savedBox = byId('notSaved');
const deployDialog = byId('deployDialog');
const deployButton = byId('deployBtn');
const deployChecks = byId('deployChecks');
const deleteDialog = byId('deleteDialog');
const deleteButton = byId('deleteBtn');
const deleteChecks = byId('deleteChecks');
const duplicateDialog = byId('duplicateDialog');
const duplicateButton = byId('duplicateBtn');
const duplicateStatus = byId('duplicateStatus');
const settingsDialog = byId('settingsDialog');

const darkMediaQuery = '(prefers-color-scheme: dark)';
let darkModeOn = false;

const sizes = ['default', '100%'];

// Ensure everything is at default before onmychange
let nameOfPanelCurrentValue = '';
nameOfPanel.value = '';
let duplicateNameCurrentValue = '';
duplicateName.value = '';
let stylesNumberCurrent = 0;
byId('style-number').value = 0;
let scriptsNumberCurrent = 0;
byId('scripts-number').value = 0;

// Templates
const globalTemplate = {
  lineNumbers: true,
  lineWrapping: false,
  htmlTemplate: `<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
`,
  cssTemplate: '',
  jsTemplate: '',
  orderingOfCreation: ['HTML', 'STYLE', 'SCRIPT'],
  theme: 'dark',
  fold: true
};
const localTemplate = {
  type: 'panel'
};
const sidebarTemplate = {
  type: 'sidebar',
  matches: ['elementsPanel', 'sourcesPanel'],
  height: 'default',
  width: 'default'
};

const globalSettingsFromStorage = localStorage.getItem('settings');
if (globalSettingsFromStorage === null) {
  localStorage.setItem('settings', JSON.stringify(globalTemplate));
} else {
  try {
    JSON.parse(globalSettingsFromStorage);
  } catch {
    localStorage.setItem('settings', JSON.stringify(globalTemplate));
  }
}

chrome.runtime.sendMessage(localStorage.getItem('extensionid'), {method: 'INFO'}, null, (response) => {
  localStorage.setItem('welcome', response.welcome);
});

// #endregion

// #region Start Up Tabs

if (localStorage.getItem('current') === null) {
  ide.currentPanel = null;
  nullAgain();
} else {
  ide.currentPanel = localStorage.getItem('current');
  byId('current-panel').innerHTML = ide.currentPanel.slice(4);
}

if (typeof parseJSON(localStorage.getItem(ide.currentPanel)) === 'object' && parseJSON(localStorage.getItem(ide.currentPanel)) !== null) {
  ide.large(parseJSON(parseJSON(localStorage.getItem(ide.currentPanel)).tabs));
  notNullAnymore();
  switchInfoMessage(ide.currentPanel);
}

// #endregion

// #region Tasks: Clean Storage, Refresh Tabs, Run onmychange

setInterval(() => {
  refreshAll();
}, 1000);

// Removes all 'null' storage keys that were accidentally created
localStorage.removeItem('null');

// Make onmychange run
setInterval(() => {
  if (nameOfPanelCurrentValue !== nameOfPanel.value) {
    nameOfPanel.onmychange();
    nameOfPanelCurrentValue = nameOfPanel.value;
  }

  if (duplicateNameCurrentValue !== duplicateName.value) {
    duplicateName.onmychange();
    duplicateNameCurrentValue = duplicateName.value;
  }

  if (stylesNumberCurrent !== byId('style-number').value) {
    byId('style-number').onmychange();
    stylesNumberCurrent = byId('style-number').value;
  }

  if (scriptsNumberCurrent !== byId('scripts-number').value) {
    byId('scripts-number').onmychange();
    scriptsNumberCurrent = byId('scripts-number').value;
  }
}, 200);

// #endregion

// #region Initialize Create Panel Action

// Get ready for creating events
byId('createBlank').addEventListener('click', () => {
  showIt(createBlankDialog);
  createBlankButton.value = '{}';
  nameOfPanel.value = '';
  byId('scripts-number').value = 0;
  byId('style-number').value = 0;
  byId('includehtml').checked = true;
});

// Startup onmychange for the panel name input
nameOfPanel.onmychange = function () {
  if (parseJSON(handleNull('total', true)).includes(nameOfPanel.value) !== true && nameOfPanel.value !== '') {
    const nextConfirm = parseJSON(createBlankButton.value);
    nextConfirm.name = nameOfPanel.value;
    createBlankButton.value = JSON.stringify(nextConfirm);
    createValid.innerHTML = 'That input is valid';
  } else {
    createBlankButton.value = '{}';
    createValid.innerHTML = 'That input is invalid';
  }
};

// Startup onmychange for the style number
byId('style-number').onmychange = function () {
  const nextConfirm = parseJSON(createBlankButton.value);
  nextConfirm.styles = byId('style-number').value;
  createBlankButton.value = JSON.stringify(nextConfirm);
};

// Startup onmychange for the scripts number
byId('scripts-number').onmychange = function () {
  const nextConfirm = parseJSON(createBlankButton.value);
  nextConfirm.scripts = byId('scripts-number').value;
  createBlankButton.value = JSON.stringify(nextConfirm);
};

// Listen for changes to the checkbox
byId('includehtml').addEventListener('change', () => {
  const nextConfirm = parseJSON(createBlankButton.value);
  nextConfirm.includehtml = byId('includehtml').checked;
  createBlankButton.value = JSON.stringify(nextConfirm);
});

// Run actions when the dialog closes
createBlankDialog.addEventListener('close', () => {
  if (
    createBlankDialog.returnValue !== '{}' &&
    parseJSON(handleNull('total', true)).includes(parseJSON(createBlankDialog.returnValue).name) !== true &&
    parseJSON(createBlankDialog.returnValue).name !== '' &&
    typeof parseJSON(createBlankDialog.returnValue).name === 'string'
  ) {
    // Parse user input
    try {
      styleNum = parseJSON(parseJSON(createBlankDialog.returnValue).styles);
    } catch {
      styleNum = 0;
    }

    if (typeof styleNum !== 'number') {
      styleNum = 0;
    }

    try {
      scriptsNum = parseJSON(parseJSON(createBlankDialog.returnValue).scripts);
    } catch {
      scriptsNum = 0;
    }

    if (typeof scriptsNum !== 'number') {
      scriptsNum = 0;
    }

    if (typeof parseJSON(parseJSON(createBlankDialog.returnValue).includehtml) !== 'boolean') {
      includehtml = true;
    }

    if (scriptsNum === 0 && styleNum === 0 && includehtml === false) {
      return;
    }

    // Ensure ordering is right
    let ordering =
      getGlobalSetting('orderingOfCreation').sort()[0] !== 'HTML' ||
      getGlobalSetting('orderingOfCreation').sort()[1] !== 'SCRIPT' ||
      getGlobalSetting('orderingOfCreation').sort()[2] !== 'STYLE' ||
      getGlobalSetting('orderingOfCreation').length !== 3
        ? ['HTML', 'STYLE', 'SCRIPT']
        : getGlobalSetting('orderingOfCreation');

    // Create the empty panel
    createBlankDialog.returnValue = parseJSON(createBlankDialog.returnValue).name;
    localStorage.setItem(
      'ide-' + createBlankDialog.returnValue,
      JSON.stringify({
        settings: localTemplate,
        tabs: []
      })
    );
    const total = parseJSON(handleNull('total', true));
    total.push(createBlankDialog.returnValue);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + createBlankDialog.returnValue);

    // Push all info to the panel
    for (const value of ordering) {
      switch (value) {
        case 'HTML':
          if (includehtml) {
            ide.createTab('HTML', {
              mode: 'htmlmixed',
              theme: getCurrentTheme(),
              lineNumbers: getGlobalSetting('lineNumbers'),
              lineWrapping: getGlobalSetting('lineWrapping'),
              value: getGlobalSetting('htmlTemplate'),
              placeholder: 'Main HTML Content...',
              styleActiveLine: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              showTrailingSpace: true,
              continueComments: true,
              scrollPastEnd: true,
              ...getFoldingConfig(),
              autoCloseTags: true,
              matchTags: {bothTags: true}
            });
          }

          break;
        case 'SCRIPT':
          for (let index = 1; index <= scriptsNum; index += 1) {
            ide.createTab('SCRIPT' + index, {
              mode: 'javascript',
              theme: getCurrentTheme(),
              lineNumbers: getGlobalSetting('lineNumbers'),
              lineWrapping: getGlobalSetting('lineWrapping'),
              value: getGlobalSetting('jsTemplate'),
              placeholder: 'JS Script...',
              styleActiveLine: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              showTrailingSpace: true,
              continueComments: true,
              scrollPastEnd: true,
              ...getFoldingConfig()
            });
          }

          break;
        case 'STYLE':
          for (let index = 1; index <= styleNum; index += 1) {
            ide.createTab('STYLE' + index, {
              mode: 'css',
              theme: getCurrentTheme(),
              lineNumbers: getGlobalSetting('lineNumbers'),
              lineWrapping: getGlobalSetting('lineWrapping'),
              value: getGlobalSetting('cssTemplate'),
              placeholder: 'CSS Styling...',
              styleActiveLine: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              showTrailingSpace: true,
              continueComments: true,
              scrollPastEnd: true,
              ...getFoldingConfig()
            });
          }

          break;
        default:
          throw new Error(`Invalid creation ${value}`);
      }
    }

    // Save all the data and ensure that it is known that there is a tab on the screen
    localStorage.setItem('ide-' + createBlankDialog.returnValue, stringifiedPack(createBlankDialog.returnValue));
    ide.openTab(0);
    notNullAnymore();
  }
});

// #endregion

// #region Initialize Switch Panel Action

// Open up the dialog when requested
byId('switch').addEventListener('click', () => {
  if (ide.currentPanel !== null) {
    if (typeof constructSelect !== 'function') {
      window.constructSelect = function () {
        let returnString = '';
        let totalArr = parseJSON(handleNull('total', true));
        for (const element of totalArr) {
          returnString += `<option value="${element}">${element}</option>`;
        }

        return returnString;
      };
    }

    showIt(otherDialog);
    confirmSwitchButton.value = parseJSON(handleNull('total', true))[0];
    byId('panelData').innerHTML = constructSelect();
  }
});

// Listen for the change of the dropdown
byId('panelData').addEventListener('change', () => {
  confirmSwitchButton.value = byId('panelData').value;
});

// Listen for the close event
otherDialog.addEventListener('close', () => {
  if (otherDialog.returnValue !== '') {
    ide.switchPanel(ide.currentPanel, 'ide-' + otherDialog.returnValue);
  }
});

// #endregion

// #region Set Up Auto-Save and Saving Action

// Listen for clicks on the save toolbar icon
byId('save').addEventListener('click', () => {
  if (ide.currentPanel === null) {
    return;
  }

  const packed = stringifiedPack(ide.currentPanel.slice(4));
  if (packed === localStorage.getItem(ide.currentPanel)) {
    byId('done-with-it').innerHTML = 'Nothing to Save';
    return showIt(byId('done-saved-dialog'));
  }

  localStorage.setItem(ide.currentPanel, packed);
  byId('done-with-it').innerHTML = 'Saved!';
  showIt(byId('done-saved-dialog'));
});

// Set up autosave
setInterval(() => {
  if (ide.currentPanel === null) {
    return;
  }

  const packed = stringifiedPack(ide.currentPanel.slice(4));
  if (packed === localStorage.getItem(ide.currentPanel)) {
    return;
  }

  savedBox.id = 'saved';
  savedBox.innerHTML = '<br><br>Saving...';
  localStorage.setItem(ide.currentPanel, packed);
  savedBox.innerHTML = '<br><br>Saved';
  setTimeout(() => {
    savedBox.id = 'notSaved';
  }, 2000);
}, 4000);

// #endregion

// #region Initialize Deploy Action

// Listen for clicks on the deploy icon
byId('deploy').addEventListener('click', () => {
  if (ide.currentPanel !== null && handleNull('total', true) !== '[]') {
    showIt(deployDialog);
    const preCheckboxes = {};
    let totalArr = parseJSON(handleNull('total', true));
    for (const nameCurrent of totalArr) {
      preCheckboxes[nameCurrent] = true;
    }

    deployButton.value = JSON.stringify(preCheckboxes);
    deployChecks.innerHTML = constructBoxes(true);
    for (let index = 0; index < parseJSON(handleNull('total', true)).length; index += 1) {
      const element = byId('checkbox-' + parseJSON(handleNull('total', true))[index]);
      element.addEventListener('change', (event) => {
        const realName = event.target.name;
        const checkedOrNot = event.target.checked;
        const currentButtonJSON = parseJSON(deployButton.value);
        currentButtonJSON[realName] = checkedOrNot;
        deployButton.value = JSON.stringify(currentButtonJSON);
      });
    }
  }
});

// Listen for the closing of the dialog
deployDialog.addEventListener('close', () => {
  if (deployDialog.returnValue !== '' && deployDialog.returnValue !== '{}') {
    const finalJSON = parseJSON(deployDialog.returnValue);
    let sendJSON = [];
    let finalJSONEntries = Object.entries(finalJSON);
    for (const element of finalJSONEntries) {
      if (element[1] === true) {
        sendJSON.push(
          Object.assign(unpack(parseJSON(localStorage.getItem('ide-' + element[0])), element[0]), {
            settings: parseJSON(parseJSON(localStorage.getItem('ide-' + element[0])).settings)
          })
        );
      }
    }

    chrome.runtime.sendMessage(
      localStorage.getItem('extensionid'),
      {method: 'SET', body: {panels: sendJSON, welcome: localStorage.getItem('welcome')}},
      (response) => {}
    );
  }
});

// #endregion

// #region Initialize Delete Panel Action

// Listen for the delete toolbar icon click
byId('delete').addEventListener('click', () => {
  if (ide.currentPanel !== null && handleNull('total', true) !== '[]') {
    showIt(deleteDialog);
    const preCheckboxes = {};
    let totalArr = parseJSON(handleNull('total', true));
    for (const nameCurrent of totalArr) {
      preCheckboxes[nameCurrent] = false;
    }

    deleteButton.value = JSON.stringify(preCheckboxes);
    deleteChecks.innerHTML = constructBoxes(false);
    for (let index = 0; index < parseJSON(handleNull('total', true)).length; index += 1) {
      const element = byId('checkbox-' + parseJSON(handleNull('total', true))[index]);
      element.addEventListener('change', (event) => {
        const realName = event.target.name;
        const checkedOrNot = event.target.checked;
        const currentButtonJSON = parseJSON(deleteButton.value);
        currentButtonJSON[realName] = checkedOrNot;
        deleteButton.value = JSON.stringify(currentButtonJSON);
      });
    }
  }
});

// Listen for the delete dialog close
deleteDialog.addEventListener('close', () => {
  if (deleteDialog.returnValue !== '' && deleteDialog.returnValue !== '{}' && typeof deleteDialog.returnValue === 'string') {
    const finalJSON = Object.entries(parseJSON(deleteDialog.returnValue)).filter((value) => value[1] === true);
    for (const element of finalJSON) {
      if (localStorage.getItem(`ide-${element[0]}`) !== null) {
        localStorage.removeItem(`ide-${element[0]}`);
      }

      if (localStorage.getItem(`preview-${element[0]}`) !== null) {
        localStorage.removeItem(`preview-${element[0]}`);
      }

      removeFromTotal(element);
    }

    if (handleNull('total', true) === '[]') {
      ide.removeAll();
      nullAgain();
    } else if (!parseJSON(handleNull('total', true)).includes(ide.currentPanel)) {
      ide.switchPanel(null, `ide-${parseJSON(handleNull('total', true))[0]}`);
    }
  }
});

// #endregion

// #region Initialize Duplicate Panel Action

// Listen for clicks on the duplicate icon
byId('duplicate').addEventListener('click', () => {
  if (ide.currentPanel !== null) {
    showIt(duplicateDialog);
    duplicateName.value = '';
  }
});

// Listen for onmychange event on the duplicate’s name
duplicateName.onmychange = function () {
  if (!parseJSON(handleNull('total', true)).includes(duplicateName.value) && duplicateName.value !== '') {
    duplicateButton.value = duplicateName.value;
    duplicateStatus.innerHTML = 'That input is valid';
  } else {
    duplicateButton.value = '';
    duplicateStatus.innerHTML = 'That input is invalid';
  }
};

// Listen for the duplicate dialog closing
duplicateDialog.addEventListener('close', () => {
  if (duplicateDialog.returnValue !== '' && typeof duplicateDialog.returnValue === 'string') {
    const setting = stringifiedPack(ide.currentPanel);
    localStorage.setItem('ide-' + duplicateDialog.returnValue, setting);
    const total = parseJSON(handleNull('total', true));
    total.push(duplicateDialog.returnValue);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + duplicateDialog.returnValue);
  }

  duplicateName.value = '';
  duplicateDialog.returnValue = '';
  duplicateButton.value = '';
});

// #endregion

// #region Initialize Template or Blank Choosing

// Listen for create icon click
byId('create').addEventListener('click', () => {
  showIt(byId('templateOrBlank'));
});

// #endregion

// #region Initialize Template Creating

// Listen for a click on the template option
byId('createTemplate').addEventListener('click', async () => {
  /**
   * Gives back all the buttons for the template page
   * @param {Array} array
   * @returns {string} The innerHTML needed
   */
  function galleryOfButtons(array) {
    innerHtmlString = '';
    window.tempArray = array;
    for (const [index, element] of array.entries()) {
      innerHtmlString += `<button onclick="runTemplate(tempArray[${index}])" class="actions templateAction">${element.title}</button>`;
    }

    return innerHtmlString;
  }

  const lsed = parseJSON(await makeRequest('GET', '/www/template/'));
  let templates = [];
  for (const [index, element] of lsed.entries()) {
    templates[index] = await makeRequest('GET', '/template/' + element);
  }

  templates = templates.map((template) => parseJSON(template));
  byId('templateMenu').innerHTML = galleryOfButtons(templates);
  showIt(byId('templateChooser'));
});

// #endregion

// #region Initialize Settings Option

// Listen for clicks on the settings icon
byId('settings').addEventListener('click', () => {
  settingsDialog.returnValue = '';
  if (ide.currentPanel === null) {
    disable(byId('panelSettings'));
  } else {
    if (typeof constructPanelSettings !== 'function') {
      /**
       * Constructs the panel settings that should be presented to the user
       * @returns {string} The innerHTML needed
       */
      window.constructPanelSettings = function () {
        const querySettings = parseJSON(parseJSON(localStorage.getItem(ide.currentPanel)).settings);
        return (
          (querySettings.type === 'sidebar'
            ? '<details class="nested-details">' +
              '<summary>Height/Width</summary>' +
              `<div id="resize-container"><div id="resize" style="width: ${
                querySettings.width === 'default' ? '100px' : querySettings.width + 'px'
              }; height: ${querySettings.height === 'default' ? '100px' : querySettings.height + 'px'};"></div></div>` +
              `<span id="resize-info">${querySettings.width} x ${querySettings.height}</span>` +
              '</details>' +
              '<details class="nested-details">' +
              '<summary>Matches</summary>' +
              `<input type="checkbox" id="elements" name="elements" onclick="setLocalSetting(ide.currentPanel, 'matches', event.target.checked ? [...getLocalSetting(ide.currentPanel, 'matches'), 'elementsPanel'] : getLocalSetting(ide.currentPanel, 'matches').filter(match => match !== 'elementsPanel'))"${
                getLocalSetting(ide.currentPanel, 'matches').includes('elementsPanel') ? ' checked' : ''
              } />` +
              '<label for="elements">Elements Panel</label>' +
              '<br />' +
              `<input type="checkbox" id="sources" name="sources" onclick="setLocalSetting(ide.currentPanel, 'matches', event.target.checked ? [...getLocalSetting(ide.currentPanel, 'matches'), 'sourcesPanel'] : getLocalSetting(ide.currentPanel, 'matches').filter(match => match !== 'sourcesPanel'))"${
                getLocalSetting(ide.currentPanel, 'matches').includes('sourcesPanel') ? ' checked' : ''
              } />` +
              '<label for="elements">Sources Panel</label>' +
              '</details>'
            : '') +
          '<details class="nested-details">' +
          '<summary class="red">Danger Zone</summary>' +
          (querySettings.type === 'panel'
            ? '<button onclick="areYouSureConvertToSidebar()" class="actions">Convert to Sidebar</button>'
            : '<button onclick="areYouSureConvertToPanel()" class="actions">Convert to Panel</button>') +
          '</details>'
        );
      };
    }

    enable(byId('panelSettings'));
    byId('panelSettingsContainer').innerHTML = constructPanelSettings();
    const innerResizeBox = document.getElementById('resize');
    if (innerResizeBox !== null) {
      new ResizeSensor(innerResizeBox, () => {
        if (getLocalSetting(ide.currentPanel, 'height') === 0 && getLocalSetting(ide.currentPanel, 'width') === 100) {
          return;
        }
        document.getElementById('resize-info').innerHTML =
          (innerResizeBox.offsetWidth === 100 ? 'default' : innerResizeBox.offsetWidth + '%') +
          ' x ' +
          (innerResizeBox.offsetHeight === 100 ? 'default' : innerResizeBox.offsetHeight + '%');
        setLocalSetting(ide.currentPanel, 'width', innerResizeBox.offsetWidth === 100 ? 'default' : innerResizeBox.offsetWidth);
        setLocalSetting(ide.currentPanel, 'height', innerResizeBox.offsetHeight === 100 ? 'default' : innerResizeBox.offsetHeight);
      });
    }
  }

  if (typeof constructGlobalSettings !== 'function') {
    /**
     * Constructs the global settings needed to present to the user
     * @returns {string} The innerHTML needed for the user
     */
    window.constructGlobalSettings = function () {
      let settingsJSON = localStorage.getItem('settings') === null ? null : parseJSON(localStorage.getItem('settings'));
      if (settingsJSON === null) {
        localStorage.setItem('settings', JSON.stringify(globalTemplate));
        settingsJSON = globalTemplate;
      }

      return (
        '<details class="nested-details">' +
        '<summary>IDE Settings</summary>' +
        '<input id="checkbox-linenumbers-global-settings" type="checkbox" onclick="setGlobalSetting(\'lineNumbers\', event.target.checked);setAllConfig(\'lineNumbers\', event.target.checked)" ' +
        (settingsJSON.lineNumbers === true ? 'checked' : '') +
        ' />' +
        '<label for="checkbox-linenumbers-global-settings">Line Numbers</label><br />' +
        '<input id="checkbox-linewrapping-global-settings" type="checkbox" onclick="setGlobalSetting(\'lineWrapping\', event.target.checked);setAllConfig(\'lineWrapping\', event.target.checked)" ' +
        (settingsJSON.lineWrapping === true ? 'checked' : '') +
        ' />' +
        '<label for="checkbox-linewrapping-global-settings">Line Wrapping</label><br />' +
        '<input id="checkbox-fold-global-settings" type="checkbox" onclick="setFoldingConfig(event.target.checked)" ' +
        (settingsJSON.fold === true ? 'checked' : '') +
        ' />' +
        '<label for="checkbox-fold-global-settings">Foldable Gutters</label>' +
        '</details>' +
        '<details class="nested-details">' +
        '<summary>Ordering of Creation</summary>' +
        '<label for="sortable-items-ordering-when-initialized">Panel Creation Ordering</label>' +
        `<div id="sortable-items-ordering-when-initialized" class="col">
        ${(Array.isArray(settingsJSON.orderingOfCreation) ? settingsJSON.orderingOfCreation : globalTemplate.orderingOfCreation)
          .map((value) => '<div class="list-group-item" data-id="' + value + '">' + value + '</div>')
          .join('')}
  </div>` +
        '</details>' +
        '<details class="nested-details">' +
        '<summary>Theme</summary>' +
        '<select onchange="decideTheme(event.target.value)" class="select-css">' +
        `<option value="dark"${settingsJSON.theme === 'dark' ? ' selected="selected"' : ''}>Dark</option>` +
        `<option value="light"${settingsJSON.theme === 'light' ? ' selected="selected"' : ''}>Light</option>` +
        `<option value="auto"${settingsJSON.theme === 'auto' ? ' selected="selected"' : ''}>Auto</option>` +
        '</select>' +
        '</details>' +
        '<details class="nested-details">' +
        '<summary>Templates</summary>' +
        '<iframe id="embeddedEditor"></iframe>' +
        '</details>' +
        '<details class="nested-details">' +
        '<summary>Welcome Message</summary>' +
        `<input type="text" value="${localStorage.getItem('welcome')}" oninput="localStorage.setItem('welcome', event.target.value)" />` +
        '</details>' +
        '<details class="nested-details">' +
        '<summary class="red">Danger Zone</summary>' +
        '<button onclick="areYouSureClear()" class="actions">Clear Storage</button>' +
        '</details>'
      );
    };
  }

  byId('globalContainer').innerHTML = constructGlobalSettings();
  let settingsJSON = localStorage.getItem('settings') === null ? null : parseJSON(localStorage.getItem('settings'));
  if (settingsJSON === null) {
    localStorage.setItem('settings', JSON.stringify(globalTemplate));
    settingsJSON = globalTemplate;
  }

  let order = new Sortable(byId('sortable-items-ordering-when-initialized'), {
    onUpdate: (event_) => {
      setGlobalSetting('orderingOfCreation', order.toArray());
    },
    animation: 150,
    multiDrag: true,
    ghostClass: 'blue-background-class',
    selectedClass: 'sortable-selected'
  });
  byId('embeddedEditor').contentWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <link href="/node_modules/codemirror/lib/codemirror.css" rel="stylesheet">
    <link href="/node_modules/codemirror/theme/cobalt.css" rel="stylesheet">
    <link href="/node_modules/codemirror/theme/base16-light.css" rel="stylesheet" />
    <link href="/node_modules/monkeyide/style.css" rel="stylesheet">
    <link href="/node_modules/codemirror/addon/dialog/dialog.css" rel="stylesheet" />
    <link href="/node_modules/codemirror/addon/fold/foldgutter.css" rel="stylesheet" />
    <link rel="stylesheet" href="style/customTheme.css" />
    <script src="/node_modules/codemirror/lib/codemirror.js"></script>
    <script src="/node_modules/codemirror/mode/htmlmixed/htmlmixed.js"></script>
    <script src="/node_modules/codemirror/mode/javascript/javascript.js"></script>
    <script src="/node_modules/codemirror/mode/xml/xml.js"></script>
    <script src="/node_modules/codemirror/mode/css/css.js"></script>
    <script src="/node_modules/codemirror/addon/dialog/dialog.js"></script>
    <script src="/node_modules/codemirror/addon/display/placeholder.js"></script>
    <script src="/node_modules/codemirror/addon/selection/active-line.js"></script>
    <script src="/node_modules/codemirror/addon/comment/comment.js"></script>
    <script src="/node_modules/codemirror/addon/comment/continuecomment.js"></script>
    <script src="/node_modules/codemirror/addon/fold/foldcode.js"></script>
    <script src="/node_modules/codemirror/addon/fold/foldgutter.js"></script>
    <script src="/node_modules/codemirror/addon/fold/brace-fold.js"></script>
    <script src="/node_modules/codemirror/addon/fold/comment-fold.js"></script>
    <script src="/node_modules/codemirror/addon/fold/xml-fold.js"></script>
    <script src="/node_modules/codemirror/addon/edit/closebrackets.js"></script>
    <script src="/node_modules/codemirror/addon/edit/matchbrackets.js"></script>
    <script src="/node_modules/codemirror/addon/edit/closetag.js"></script>
    <script src="/node_modules/codemirror/addon/edit/matchtags.js"></script>
    <script src="/node_modules/codemirror/addon/edit/trailingspace.js"></script>
    <script src="/node_modules/codemirror/addon/search/searchcursor.js"></script>
    <script src="/node_modules/codemirror/addon/search/search.js"></script>
    <script src="/node_modules/codemirror/addon/search/jump-to-line.js"></script>
    <script src="/node_modules/codemirror/addon/scroll/scrollpastend.js"></script>
    <script src="/node_modules/darkreader/darkreader.js"></script>
    <script src="ide-keys.js"></script>
  </head>
  <body>
    <script src="/node_modules/monkeyide/index.js"></script>
    <script src="common-helpers.js"></script>
    <script>
      ide.large([
        {
          name: 'htmlTemp',
          configuration: {
            value: \`${settingsJSON.htmlTemplate}\`,
            lineWrapping: ${settingsJSON.lineWrapping},
            lineNumbers: ${settingsJSON.lineNumbers},
            theme: getCurrentTheme(),
            mode: 'htmlmixed',
            placeholder: 'HTML Template...',
            styleActiveLine: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            showTrailingSpace: true,
            continueComments: true,
            scrollPastEnd: true,
            ...getFoldingConfig(),
            autoCloseTags: true,
            matchTags: { bothTags: true },
          },
        },
        {
          name: 'cssTemp',
          configuration: {
            value: \`${settingsJSON.cssTemplate}\`,
            lineWrapping: ${settingsJSON.lineWrapping},
            lineNumbers: ${settingsJSON.lineNumbers},
            theme: getCurrentTheme(),
            mode: 'css',
            placeholder: 'CSS Template...',
            styleActiveLine: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            showTrailingSpace: true,
            continueComments: true,
            scrollPastEnd: true,
            ...getFoldingConfig(),
          },
        },
        {
          name: 'jsTemp',
          configuration: {
            value: \`${settingsJSON.jsTemplate}\`,
            lineWrapping: ${settingsJSON.lineWrapping},
            lineNumbers: ${settingsJSON.lineNumbers},
            theme: getCurrentTheme(),
            mode: 'javascript',
            placeholder: 'JavaScript Template...',
            styleActiveLine: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            showTrailingSpace: true,
            continueComments: true,
            scrollPastEnd: true,
            ...getFoldingConfig(),
          },
        },
      ]);
      ide.getTab(0).mirror.on('change', (instance, obj) => {
        setGlobalSetting('htmlTemplate', ide.getCodeByTab(0));
      });
      ide.getTab(1).mirror.on('change', (instance, obj) => {
        setGlobalSetting('cssTemplate', ide.getCodeByTab(1));
      });
      ide.getTab(2).mirror.on('change', (instance, obj) => {
        setGlobalSetting('jsTemplate', ide.getCodeByTab(2));
      });
      refreshAll();
    </script>
  </body>
</html>
`);
  byId('embeddedEditor').contentWindow.addEventListener('load', () => {
    if (darkModeOn && !byId('embeddedEditor').contentDocument.body.classList.contains('dark')) {
      byId('embeddedEditor').contentDocument.body.classList = 'dark';
    }
  });

  showIt(settingsDialog);
});

// #endregion

// #region Are you sure?

byId('yesSure').addEventListener('click', () => {
  byId('sureOrNot').returnValue = 'true';
});

byId('notSure').addEventListener('click', () => {
  byId('sureOrNot').returnValue = 'false';
});

byId('sureOrNot').addEventListener('close', () => {
  if (typeof areyousure !== 'function') {
    return;
  }

  areyousure(byId('sureOrNot').returnValue === 'true');
});

// #endregion

// #region Cookie Banner

if (localStorage.getItem('cookieSeen') !== 'shown') {
  enable(byId('cookie-banner'));
  localStorage.setItem('cookieSeen', 'shown');
}

byId('close').addEventListener('click', () => {
  disable(byId('cookie-banner'));
});

// #endregion

// #region Theming

DarkReader.setFetchMethod(fetch);

if (getGlobalSetting('theme') === 'dark') {
  startDarkMode();
} else if (document.body.classList.contains('dark')) {
  document.body.classList.remove('dark');
}

matchMedia(darkMediaQuery).addEventListener('change', (event) => {
  if (getGlobalSetting('theme') === 'auto') {
    if (event.matches) {
      startDarkMode();
    } else {
      turnOffDarkMode();
    }
  }
});

// #endregion

// #region Loader

disable(byId('loaderContainer'));
document.querySelector('body').style.cursor = 'default';

// #endregion
