// Start up welcome messages
chrome.storage.sync.get(['welcome'], (data) => {
  if (data.welcome !== null) {
    if (data.welcome !== undefined && data.welcome !== '') {
      console.log(data.welcome);
    } else {
      chrome.storage.sync.set({welcome: ''});
    }
  }
});

// Cache the DevTools theme if avaliable
if (typeof chrome.devtools.panels.themeName === 'string') {
  chrome.storage.sync.set({devtoolsTheme: chrome.devtools.panels.themeName});
}

/**
 * Inits the sidebars and panels that are given from storage
 * @param {Object[]} panels The panels array
 */
function initDevTools(panels) {
  for (const panel of panels) {
    if (panel.settings.type === 'panel') {
      chrome.devtools.panels.create(panel.title, 'empty.png', 'panel.html', (extensionPanel) => {
        extensionPanel.onShown.addListener((panelWindow) => {
          if (panelWindow.document.querySelector('resetDevtools') === null) {
            panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
              {
                method: 'RUN',
                function: 'onShown',
                args: [{type: 'special', value: 'window'}]
              },
              '*'
            );
            panelWindow.document.querySelector('#sandbox').contentWindow.shown = true;
            panelWindow.document.querySelector('#sandbox').contentWindow.hidden = false;
            return;
          }

          panelWindow.document.querySelector('resetDevtools').remove();
          panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
            {
              body: panel
            },
            '*'
          );
          extensionPanel.onSearch.addListener((action, query) => {
            panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
              {
                method: 'RUN',
                function: 'onSearch',
                args: [
                  {type: 'normal', value: action},
                  {type: 'normal', value: query}
                ]
              },
              '*'
            );
          });
          extensionPanel.onHidden.addListener(() => {
            panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
              {
                method: 'RUN',
                function: 'onHidden',
                args: []
              },
              '*'
            );
            panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
              {
                method: 'SET',
                var: 'shown',
                value: false
              },
              '*'
            );
            panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
              {
                method: 'SET',
                var: 'hidden',
                value: true
              },
              '*'
            );
          });
          panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
            {
              method: 'RUN',
              function: 'onShown',
              args: [{type: 'special', value: 'window'}]
            },
            '*'
          );
          panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
            {
              method: 'SET',
              var: 'shown',
              value: true
            },
            '*'
          );
          panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
            {
              method: 'SET',
              var: 'hidden',
              value: false
            },
            '*'
          );
        });
      });
    } else if (panel.settings.type === 'devtools-script') {
      const iframeContainer = document.getElementById('devtools-script-iframes');
      iframeContainer.innerHTML += `<iframe id="sandbox-${iframeContainer.childNodes.length}" src="sandbox.html"></iframe>`;
      iframeContainer.querySelector('#sandbox-' + (iframeContainer.childNodes.length - 1)).addEventListener('load', () =>
        iframeContainer.querySelector('#sandbox-' + (iframeContainer.childNodes.length - 1)).contentWindow.postMessage(
          {
            body: panel
          },
          '*'
        )
      );
    } else if (panel.settings.matches.includes('elementsPanel') || panel.settings.matches.includes('sourcesPanel')) {
      for (const match of panel.settings.matches) {
        console.log(match);
        if (['elementsPanel', 'sourcesPanel'].includes(match)) {
          chrome.devtools.panels[match === 'elementsPanel' ? 'elements' : 'sources'].createSidebarPane(panel.title, (sidebar) => {
            sidebar.setPage('panel.html');
            if (panel.settings.height !== 'default' && typeof panel.settings.height === 'string') {
              sidebar.setHeight(panel.settings.height + '%');
            }
            if (panel.settings.width !== 'default' && typeof panel.settings.width === 'string') {
              sidebar.setWidth(panel.settings.width + '%');
            }
            sidebar.onShown.addListener((panelWindow) => {
              sidebar.onShown.removeListener();
              panelWindow.document.querySelector('#sandbox').contentWindow.postMessage(
                {
                  body: panel
                },
                '*'
              );
            });
          });
        }
      }
    }
  }
}

// Read the panels and decide based on their value
chrome.storage.sync.get('panels', (data) => {
  if ([null, undefined].includes(data.panels)) {
    chrome.storage.sync.set({panels: []});
  } else if (validPanelLst(data.panels)) {
    initDevTools(data.panels);
  } else {
    throw new Error('Invalid panels passed in');
  }
});
