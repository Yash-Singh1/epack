window.$docsify = {
  name: 'epack',
  coverpage: true,
  repo: 'https://github.com/Yash-Singh1/epack',
  loadSidebar: true,
  loadNavbar: true,
  auto2top: true,
  mergeNavbar: true,
  maxLevel: 3,
  subMaxLevel: 3,
  notFoundPage: true,
  executeScript: true,
  plugins: [
    function (hook, vm) {
      hook.beforeEach((html) => {
        const url =
          'https://github.com/Yash-Singh1/' +
          (vm.route.file.startsWith('MONKEYIDE') ? 'monkeyide' : 'epack') +
          '/blob/main/' +
          (/(README|CONTRIBUTING|LICENSE|ROADMAP|CODE_OF_CONDUCT|ARCHITECTURE)/.test(vm.route.file) ? '' : 'docs/') +
          (vm.route.file.startsWith('MONKEYIDE') ? vm.route.file.slice(10) : vm.route.file);
        const editHtml = `<p align="right">:memo: <a href="${url}">Edit this Page</a></p>\n\n`;
        if (html.includes('404')) {
          return html;
        }

        if (window.location.hash.startsWith('#/docs/')) {
          window.location.hash = window.location.hash.replace('/docs/', '');
        }

        return vm.route.file.includes('LICENSE.md') ? '<strong id="license">' + html + '</strong>' : editHtml + html;
      });
    }
  ],
  count: {
    position: 'bottom',
    isExpected: false
  },
  copyCode: {
    buttonText: 'Copy Code',
    errorText: 'Error Copying Code',
    successText: 'Copied <span style="color: green">✓</span>'
  },
  themeColor: '#3F51B5',
  alias: {
    '/docs/(.*)': '/$1',
    '/MONKEYIDE_README': 'https://raw.githubusercontent.com/Yash-Singh1/monkeyide/master/README.md'
  }
};

DarkReader.setFetchMethod(fetch);
DarkReader.enable({
  contrast: 90,
  selectionColor: 'orange'
});
