// #region Helper Functions

function byId(id) {
  return document.getElementById(id);
}

function makeRequest(method, url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    if (method == 'POST' && data) {
      xhr.send(data);
    } else {
      xhr.send();
    }
  });
}

function galleryOfButtons(array) {
  innerHtmlString = '';
  window.tempArray = array;
  for (let i = 0; i < array.length; i++) {
    let element = array[i];
    innerHtmlString +=
      '<button onclick="runTemplate(tempArray[' +
      i +
      '])" class="actions newActions templateAction">' +
      element.name +
      '</button>';
  }
  return innerHtmlString;
}

function runTemplate(target) {
  if (!JSON.parse(handleNull('total', true)).includes(target.name)) {
    localStorage.setItem(
      'ide-' + target.name,
      JSON.stringify({
        settings: {},
        tabs: [],
      })
    );
    let total = JSON.parse(handleNull('total', true));
    total.push(target.name);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + target.name);
    ide.large(target.tabs);
    localStorage.setItem('ide-' + target.name, stringifiedPack(target.name));
    byId('current-panel-wrapper').style.display = 'block';
    ide.openTab(0);
    resizeTabs();
    byId('tabs').style.display = 'block';
    document.querySelector('.tabbuttons').style.display = 'block';
  }
}

function getByNameObj(obj, nameWanted) {
  for (let i = 0; i < obj.length; i++) {
    let element = obj[i];
    if (element.name == nameWanted) {
      return obj[i];
    }
  }
}

setInterval(function () {
  localStorage.removeItem('null');
}, 1000);

function unpack(lst, nameIt) {
  lst = myParse(lst);
  let returned = {};
  returned.content = getByNameObj(lst, 'HTML').configuration.value;
  returned.title = nameIt;
  let currentNum = 1;
  while (true) {
    if (!getByNameObj(lst, 'STYLE' + currentNum)) {
      currentNum -= 1;
      break;
    } else {
      currentNum += 1;
    }
  }
  anotherNum = 1;
  while (true) {
    if (!getByNameObj(lst, 'SCRIPT' + anotherNum)) {
      anotherNum -= 1;
      break;
    } else {
      anotherNum += 1;
    }
  }
  if (currentNum !== 0) {
    returned.styles = [];
  }
  if (anotherNum !== 0) {
    returned.scripts = [];
  }
  for (let i = 1; i <= currentNum; i++) {
    returned.styles.push(getByNameObj(lst, 'STYLE' + i).configuration.value);
  }
  for (let b = 1; b <= anotherNum; b++) {
    returned.scripts.push(getByNameObj(lst, 'SCRIPT' + b).configuration.value);
  }
  return returned;
}

// Make onmychange run
setInterval(function () {
  if (nameOfPanelCurrentValue !== nameOfPanel.value) {
    nameOfPanel.onmychange();
    nameOfPanelCurrentValue = nameOfPanel.value;
  }
  if (duplicateNameCurrentValue !== duplicateName.value) {
    duplicateName.onmychange();
    duplicateNameCurrentValue = duplicateName.value;
  }
  if (stylesNumCurrent != byId('style-number').value) {
    byId('style-number').onmychange();
    stylesNumCurrent = byId('style-number').value;
  }
  if (scriptsNumCurrent != byId('scripts-number').value) {
    byId('scripts-number').onmychange();
    scriptsNumCurrent = byId('scripts-number').value;
  }
}, 100);

function stringifiedPack(query) {
  return JSON.stringify({
    tabs: JSON.stringify(ide.pack(ide.files)),
    settings: JSON.parse(handleNull('ide-' + query)).settings,
  });
}

function handleNull(item, list) {
  if (
    localStorage.getItem(item) === null ||
    localStorage.getItem(item) === ''
  ) {
    let toReturn =
      list === true
        ? '[]'
        : JSON.stringify({
            settings: {},
            tabs: [],
          });
    localStorage.setItem(item, toReturn);
    return toReturn;
  } else {
    return localStorage.getItem(item);
  }
}

function constructBoxes(allChecked) {
  let returnString = '';
  checkedAtrribute = '';
  if (allChecked === true) {
    checkedAtrribute = ' checked';
  }
  for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
    let element = JSON.parse(handleNull('total', true))[i];
    returnString +=
      '<input id="checkbox-' +
      element +
      '" type="checkbox" name="' +
      element +
      '"' +
      checkedAtrribute +
      '>' +
      '<label for="' +
      element +
      '" style="margin-left: 3px; color: white;">' +
      element +
      '</label><br>';
  }
  return returnString;
}

function showIt(modal) {
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    alert('The <dialog> API is not supported by this browser');
  }
}

ide.switchPanel = function (current, newer) {
  current !== null
    ? localStorage.setItem(current, stringifiedPack(current.substring(4)))
    : undefined;
  localStorage.setItem('current', newer);
  ide.removeAll();
  ide.large(myParse(JSON.parse(handleNull(newer)).tabs));
  ide.currentPanel = newer;
  byId('current-panel').innerHTML = newer.substring(4);
  resizeTabs();
  refreshAll();
};

function myParse(content) {
  return typeof content === 'string' ? JSON.parse(content) : content;
}

function constructSelect() {
  let returnString = '';
  for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
    let element = JSON.parse(handleNull('total', true))[i];
    returnString += '<option value="' + element + '">' + element + '</option>';
  }
  return returnString;
}

function resizeTabs() {
  document.querySelectorAll('.tabcontent > .CodeMirror').forEach((element) => {
    element.CodeMirror.setSize(...sizes);
  });
}

function refreshAll() {
  document.querySelectorAll('.tabcontent > .CodeMirror').forEach((element) => {
    element.CodeMirror.refresh();
  });
}

ide.createTab = (function () {
  var cached_function = ide.createTab;

  return function () {
    var result = cached_function.apply(this, arguments);
    refreshAll();
    return result;
  };
})();

// #endregion

// #region Initialize Variables

var extensionid = 'hjmakdlmddnejdocnlcjhikhdoiilphk';
var favDialog = byId('favDialog');
var createValid = byId('status');
var nameOfPanel = byId('name');
var duplicateName = byId('duplicateName');
var confirmBtn = byId('confirmBtn');
var otherBtn = byId('confirmBtn2');
var otherDialog = byId('switchDialog');
var savedBox = byId('notSaved');
var deployDialog = byId('deployDialog');
var deployBtn = byId('confirmBtn3');
var deployChecks = byId('deployChecks');
var deleteDialog = byId('deleteDialog');
var deleteBtn = byId('confirmBtn4');
var deleteChecks = byId('deleteChecks');
var duplicateDialog = byId('duplicateDialog');
var duplicateBtn = byId('confirmBtn5');
var duplicateStatus = byId('duplicateStatus');
const sizes = ['default', '100%'];
var nameOfPanelCurrentValue = '';
nameOfPanel.value = '';
var duplicateNameCurrentValue = '';
duplicateName.value = '';
var stylesNumCurrent = 0;
byId('style-number').value = 0;
var scriptsNumCurrent = 0;
byId('scripts-number').value = 0;

if (localStorage.getItem('extensionid') !== null) {
  extensionid = localStorage.getItem('extensionid');
}

// #endregion

// #region Start Up Tabs

if (localStorage.getItem('current') === null) {
  ide.currentPanel = null;
} else {
  ide.currentPanel = localStorage.getItem('current');
}

if (ide.currentPanel !== null) {
  byId('current-panel').innerHTML = ide.currentPanel.substring(4);
} else {
  byId('current-panel-wrapper').style.display = 'none';
  byId('tabs').style.display = 'none';
  document.querySelector('.tabbuttons').style.display = 'none';
}

if (
  typeof JSON.parse(localStorage.getItem(ide.currentPanel)) === 'object' &&
  JSON.parse(localStorage.getItem(ide.currentPanel)) !== null
) {
  ide.large(myParse(JSON.parse(localStorage.getItem(ide.currentPanel)).tabs));
  resizeTabs();
}

// #endregion

// #region Initialize Create Panel Action

byId('createBlank').onclick = function () {
  showIt(favDialog);
  confirmBtn.value = '{}';
  nameOfPanel.value = '';
  byId('scripts-number').value = 0;
  byId('style-number').value = 0;
};

nameOfPanel.onmychange = function () {
  if (
    JSON.parse(handleNull('total', true)).includes(nameOfPanel.value) !==
      true &&
    nameOfPanel.value !== ''
  ) {
    let nextConfirm = JSON.parse(confirmBtn.value);
    nextConfirm.name = nameOfPanel.value;
    confirmBtn.value = JSON.stringify(nextConfirm);
    createValid.innerHTML = 'That input is valid';
  } else {
    confirmBtn.value = '{}';
    createValid.innerHTML = 'That input is invalid';
  }
};

byId('style-number').onmychange = function () {
  let nextConfirm = JSON.parse(confirmBtn.value);
  nextConfirm.styles = byId('style-number').value;
  confirmBtn.value = JSON.stringify(nextConfirm);
};

byId('scripts-number').onmychange = function () {
  let nextConfirm = JSON.parse(confirmBtn.value);
  nextConfirm.scripts = byId('scripts-number').value;
  confirmBtn.value = JSON.stringify(nextConfirm);
};

favDialog.addEventListener('close', function () {
  if (
    favDialog.returnValue !== '{}' &&
    JSON.parse(handleNull('total', true)).includes(
      JSON.parse(favDialog.returnValue).name
    ) !== true &&
    JSON.parse(favDialog.returnValue).name !== '' &&
    typeof JSON.parse(favDialog.returnValue).name === 'string'
  ) {
    try {
      styleNum = JSON.parse(JSON.parse(favDialog.returnValue).styles);
    } catch {
      styleNum = 0;
    }
    if (typeof styleNum !== 'number') {
      styleNum = 0;
    }
    try {
      scriptsNum = JSON.parse(JSON.parse(favDialog.returnValue).scripts);
    } catch {
      scriptsNum = 0;
    }
    if (typeof scriptsNum !== 'number') {
      scriptsNum = 0;
    }
    favDialog.returnValue = JSON.parse(favDialog.returnValue).name;
    localStorage.setItem(
      'ide-' + favDialog.returnValue,
      JSON.stringify({
        settings: {},
        tabs: [],
      })
    );
    let total = JSON.parse(handleNull('total', true));
    total.push(favDialog.returnValue);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + favDialog.returnValue);
    ide.createTab('HTML', {
      mode: 'htmlmixed',
      theme: 'cobalt',
      lineNumbers: true,
      value: `<html>
  <head></head>
  <body></body>
</html>
`,
    });
    for (let i = 1; i <= styleNum; i++) {
      ide.createTab('STYLE' + i, {
        mode: 'css',
        theme: 'cobalt',
        lineNumbers: true,
        value: '',
      });
    }
    for (let b = 1; b <= scriptsNum; b++) {
      ide.createTab('SCRIPT' + b, {
        mode: 'javascript',
        theme: 'cobalt',
        lineNumbers: true,
        value: '',
      });
    }
    localStorage.setItem(
      'ide-' + favDialog.returnValue,
      stringifiedPack(favDialog.returnValue)
    );
    byId('current-panel-wrapper').style.display = 'block';
    ide.openTab(0);
    resizeTabs();
    byId('tabs').style.display = 'block';
    document.querySelector('.tabbuttons').style.display = 'block';
  }
});

// #endregion

// #region Initialize Switch Panel Action

byId('panelData').onchange = function () {
  otherBtn.value = byId('panelData').value;
};

byId('switch').onclick = function () {
  if (ide.currentPanel !== null) {
    showIt(otherDialog);
    otherBtn.value = JSON.parse(handleNull('total', true))[0];
    byId('panelData').innerHTML = constructSelect();
  }
};

otherDialog.addEventListener('close', function () {
  if (otherDialog.returnValue !== '') {
    ide.switchPanel(ide.currentPanel, 'ide-' + otherDialog.returnValue);
  }
});

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('switch').style.display = 'none';
  } else {
    byId('switch').style.display = 'block';
  }
}, 100);

// #endregion

// #region Set Up Auto-Save and Saving Action

byId('save').onclick = function () {
  if (ide.currentPanel === null) {
    return;
  }
  localStorage.setItem(ide.currentPanel, stringifiedPack());
  showIt(byId('done-saved-dialog'));
};

setInterval(function () {
  if (ide.currentPanel === null) {
    return;
  }
  savedBox.id = 'saved';
  savedBox.innerHTML = '<br><br>Saving...';
  localStorage.setItem(ide.currentPanel, stringifiedPack());
  savedBox.innerHTML = '<br><br>Saved';
  setTimeout(function () {
    savedBox.id = 'notSaved';
  }, 3000);
}, 10000);

setInterval(function () {
  if (ide.currentPanel !== null) {
    byId('save').style.display = 'block';
  } else {
    byId('save').style.display = 'none';
  }
}, 100);

// #endregion

// #region Initialize Deploy Action

byId('deploy').onclick = function () {
  if (ide.currentPanel !== null && handleNull('total', true) !== '[]') {
    showIt(deployDialog);
    let preCheckboxes = {};
    for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
      let nameCurrent = JSON.parse(handleNull('total', true))[i];
      preCheckboxes[nameCurrent] = true;
    }
    deployBtn.value = JSON.stringify(preCheckboxes);
    deployChecks.innerHTML = constructBoxes(true);
    for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
      let element = byId(
        'checkbox-' + JSON.parse(handleNull('total', true))[i]
      );
      element.onchange = function (event) {
        let realName = event.target.name;
        let checkedOrNot = event.target.checked;
        let currentBtnJSON = JSON.parse(deployBtn.value);
        currentBtnJSON[realName] = checkedOrNot;
        deployBtn.value = JSON.stringify(currentBtnJSON);
      };
    }
  }
};

deployDialog.addEventListener('close', function () {
  if (deployDialog.returnValue !== '' && deployDialog.returnValue !== '{}') {
    let finalJSON = JSON.parse(deployDialog.returnValue);
    let sendJSON = [];
    for (let i = 0; i < Object.entries(finalJSON).length; i++) {
      let element = Object.entries(finalJSON)[i];
      if (element[1] === true) {
        sendJSON.push(
          unpack(
            JSON.parse(localStorage.getItem('ide-' + element[0])).tabs,
            element[0]
          )
        );
      }
    }
    chrome.runtime.sendMessage(
      extensionid,
      { method: 'SET', body: { panels: sendJSON } },
      function (response) {}
    );
  }
});

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('deploy').style.display = 'none';
  } else {
    byId('deploy').style.display = 'block';
  }
}, 100);

// #endregion

// #region Initialize Delete Panel Action

byId('delete').onclick = function () {
  if (ide.currentPanel !== null && handleNull('total', true) !== '[]') {
    showIt(deleteDialog);
    let preCheckboxes = {};
    for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
      let nameCurrent = JSON.parse(handleNull('total', true))[i];
      preCheckboxes[nameCurrent] = false;
    }
    deleteBtn.value = JSON.stringify(preCheckboxes);
    deleteChecks.innerHTML = constructBoxes(false);
    for (let i = 0; i < JSON.parse(handleNull('total', true)).length; i++) {
      let element = byId(
        'checkbox-' + JSON.parse(handleNull('total', true))[i]
      );
      element.onchange = function (event) {
        let realName = event.target.name;
        let checkedOrNot = event.target.checked;
        let currentBtnJSON = JSON.parse(deleteBtn.value);
        currentBtnJSON[realName] = checkedOrNot;
        deleteBtn.value = JSON.stringify(currentBtnJSON);
      };
    }
  }
};

deleteDialog.addEventListener('close', function () {
  if (
    deleteDialog.returnValue !== '' &&
    deleteDialog.returnValue !== '{}' &&
    typeof deleteDialog.returnValue === 'string'
  ) {
    let finalJSON = JSON.parse(deleteDialog.returnValue);
    let index;
    for (let i = 0; i < Object.entries(finalJSON).length; i++) {
      let element = Object.entries(finalJSON)[i];
      if (element[1] === true) {
        localStorage.removeItem('ide-' + element[0]);
        let totally = JSON.parse(handleNull('total', true));
        let futureTotally = [];
        for (index = 0; index < totally.length; index++) {
          let thisElement = totally[index];
          if (thisElement !== element[0]) {
            futureTotally.push(thisElement);
          }
        }
        localStorage.setItem('total', JSON.stringify(futureTotally));
      }
    }
    if (handleNull('total', true) == '[]') {
      ide.removeAll();
      ide.currentPanel = null;
      localStorage.removeItem('current');
      byId('current-panel-wrapper').style.display = 'none';
      byId('tabs').style.display = 'none';
      document.querySelector('.tabbuttons').style.display = 'none';
    } else if (
      !JSON.parse(handleNull('total', true)).includes(ide.currentPanel)
    ) {
      ide.switchPanel(null, 'ide-' + JSON.parse(handleNull('total', true))[0]);
    }
  }
});

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('delete').style.display = 'none';
  } else {
    byId('delete').style.display = 'block';
  }
}, 100);

// #endregion

// #region Initialize Duplicate Panel Action

byId('duplicate').onclick = function () {
  if (ide.currentPanel !== null) {
    showIt(duplicateDialog);
    duplicateName.value = '';
  }
};

duplicateName.onmychange = function () {
  if (
    !JSON.parse(handleNull('total', true)).includes(duplicateName.value) &&
    duplicateName.value !== ''
  ) {
    duplicateBtn.value = duplicateName.value;
    duplicateStatus.innerHTML = 'That input is valid';
  } else {
    duplicateBtn.value = '';
    duplicateStatus.innerHTML = 'That input is invalid';
  }
};

duplicateDialog.addEventListener('close', function () {
  if (
    duplicateDialog.returnValue !== '' &&
    typeof duplicateDialog.returnValue === 'string'
  ) {
    let setting = stringifiedPack(ide.currentPanel);
    localStorage.setItem('ide-' + duplicateDialog.returnValue, setting);
    let total = JSON.parse(handleNull('total', true));
    total.push(duplicateDialog.returnValue);
    localStorage.setItem('total', JSON.stringify(total));
    ide.switchPanel(ide.currentPanel, 'ide-' + duplicateDialog.returnValue);
    byId('tabs').style.display = 'block';
    document.querySelector('.tabbuttons').style.display = 'block';
  }
  duplicateName.value = '';
  duplicateDialog.returnValue = '';
  duplicateBtn.value = '';
  resizeTabs();
});

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('duplicate').style.display = 'none';
  } else {
    byId('duplicate').style.display = 'block';
  }
}, 100);

// #endregion

// #region Initialize Preview Panel Link

setInterval(function () {
  if (ide.currentPanel !== null) {
    try {
      byId('preview-panel').href =
        '/preview-panel.html?panel=' + ide.currentPanel.substring(4);
    } catch {}
  } else {
    byId('preview-panel').removeAttribute('href');
  }
}, 100);

setInterval(function () {
  if (ide.currentPanel !== null) {
    byId('preview-panel').style.display = 'block';
  } else {
    byId('preview-panel').style.display = 'none';
  }
}, 100);

// #endregion

// #region Initialize Template or Blank Choosing

byId('create').onclick = function () {
  showIt(byId('templateOrBlank'));
};

// #endregion

// #region Initialize Template Creating

byId('createTemplate').onclick = async function () {
  let lsed = JSON.parse(await makeRequest('GET', '/ls'));
  let templates = [];
  for (let i = 0; i < lsed.length; i++) {
    templates[i] = await makeRequest('GET', '/template/' + lsed[i]);
  }
  templates = templates.map(function (template) {
    return JSON.parse(template);
  });
  byId('templateMenu').innerHTML = galleryOfButtons(templates);
  showIt(byId('templateChooser'));
};

// #endregion

// #region Initialize Settings Option

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('settings').style.right = '26px';
  } else {
    byId('settings').style.right = '';
  }
}, 100);

// #endregion

// #region Cookie Banner

if (localStorage.getItem('cookieSeen') !== 'shown') {
  byId('cookie-banner').style.display = 'block';
  localStorage.setItem('cookieSeen', 'shown');
}

byId('close').onclick = function () {
  byId('cookie-banner').style.display = 'none';
};

// #endregion

// #region Start up dark mode

DarkReader.setFetchMethod(fetch);
DarkReader.enable(
  {
    contrast: 90,
    textStroke: 0.3,
  },
  {
    invert: [
      '.switchPNG',
      '.duplicatePNG',
      '.previewPNG',
      '.settingsPNG',
      'img[src="img/blank.png"]',
      '#styles-label',
      '#scripts-label',
    ],
    css: `body, html {
      background-color: var(--darkreader-neutral-background) !important;
    }`,
  }
);

// #endregion

// #region Start Message

setInterval(() => {
  if (ide.currentPanel === null) {
    byId('msgStart').style.display = 'block';
  } else {
    byId('msgStart').style.display = 'none';
  }
}, 100);

// #endregion

// #region Loader

byId('loaderContainer').style.display = 'none';

// #endregion
