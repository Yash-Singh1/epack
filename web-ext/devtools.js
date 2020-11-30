chrome.storage.sync.get(['welcome'], function (data) {
  if (data.welcome != null) {
    if (data.welcome != undefined) {
      console.log(data.welcome);
    } else {
      chrome.storage.sync.set({ welcome: '' });
    }
  }
});

chrome.storage.sync.set({ devtoolsTheme: chrome.devtools.panels.themeName });

function initDevTools(panels) {
  panels.forEach(function (panel) {
    chrome.devtools.panels.create(
      panel.title,
      'empty.png',
      'panel.html',
      function (extensionPanel) {
        extensionPanel.onShown.addListener(function (panelWindow) {
          if (panelWindow.document.querySelector('resetDevTool') === null) {
            return;
          } else {
            panelWindow.document.querySelector('resetDevTool').remove();
          }
          panelWindow.document
            .getElementById('sandbox')
            .contentWindow.postMessage(
              {
                command: 'render',
                body: {
                  content: panel.content,
                  styles: panel.styles,
                  scripts: panel.scripts,
                },
              },
              '*'
            );
          // panelWindow.document.querySelector("html").remove();
          // panelWindow.document.write(panel.content);
          // if (Array.isArray(panel.styles)) {
          //   panel.styles.forEach((styleElement) => {
          //     if (typeof styleElement === "string") {
          //       let nextStyle = panelWindow.document.createElement("style");
          //       nextStyle.innerHTML = styleElement;
          //       panelWindow.document.head.appendChild(nextStyle);
          //     }
          //   });
          // }
        });
      }
    );
  });
}

function validPanelObj(panelsGiven) {
  if (!Array.isArray(panelsGiven)) {
    return false;
  }
  if (panelsGiven == []) {
    return true;
  }
  for (let i = 0; i < panelsGiven.length; i++) {
    if (
      typeof panelsGiven[i] !== 'object' ||
      !panelsGiven[i].title ||
      (!panelsGiven[i].content && panelsGiven[i].content !== '')
    ) {
      return false;
    }
  }
  return true;
}

chrome.storage.sync.get('panels', function (data) {
  if (data.panels == undefined || data.panels == null) {
    chrome.storage.sync.set({ panels: [] });
    return;
  } else if (!validPanelObj(data.panels)) {
    console.error('Invalid panels passed in:', data.panels);
    return;
  }
  initDevTools(data.panels);
});
