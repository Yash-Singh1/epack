const unpack = require('../../www/unpack');

describe('unpack function', () => {
  test('takes non-empty string panel', () => {
    expect(() => unpack('', 'abc')).toThrow();
  });

  test('returned title includes panelName', () => {
    expect(unpack({}, 'abc').title).toBe('abc');
    expect(unpack({}, 123).title).toBe(123);
    expect(unpack({}).title).toBeUndefined();
  });

  test('accepts tabs', () => {
    expect(() => unpack({tabs: []}, 'panelName')).not.toThrow();
    expect(() => unpack({tabs: [{name: 'HTML', configuration: {value: '<html></html>'}}]}, 'panelName')).not.toThrow();
    expect(() =>
      unpack(
        {
          tabs: [
            {name: 'HTML', configuration: {value: '<html></html>'}},
            {name: 'SCRIPT1', configuration: {value: 'console.log'}},
            {name: 'STYLE1', configuration: {value: 'body{}'}}
          ]
        },
        'panelName'
      )
    ).not.toThrow();
  });

  test('returns content when given HTML tab', () => {
    expect(unpack({tabs: [{name: 'HTML', configuration: {value: '<html></html>'}}]}, 'panelName').content).toBe('<html></html>');
    expect(
      unpack(
        {
          tabs: [
            {name: 'HTML', configuration: {value: '<html></html>'}},
            {name: 'SCRIPT1', configuration: {value: 'console.log'}},
            {name: 'STYLE1', configuration: {value: 'body{}'}}
          ]
        },
        'panelName'
      ).content
    ).toBe('<html></html>');
    expect(
      unpack({
        tabs: [
          {name: 'HTML', configuration: {value: '<html></html>'}},
          {name: 'SCRIPT1', configuration: {value: 'console.log'}},
          {name: 'SCRIPT2', configuration: {value: 'console.info'}},
          {name: 'SCRIPT3', configuration: {value: 'console.error'}},
          {name: 'STYLE1', configuration: {value: 'body{}'}},
          {name: 'STYLE2', configuration: {value: 'body,html{}'}}
        ]
      }).content
    ).toBe('<html></html>');
  });

  test('returned content contains scripts', () => {
    expect(
      unpack({
        tabs: [
          {name: 'HTML', configuration: {value: '<html></html>'}},
          {name: 'SCRIPT1', configuration: {value: 'console.log'}},
          {name: 'SCRIPT2', configuration: {value: 'console.info'}},
          {name: 'SCRIPT3', configuration: {value: ';;'}},
          {name: 'STYLE1', configuration: {value: 'body{}'}},
          {name: 'STYLE2', configuration: {value: 'body,html{}'}}
        ]
      }).scripts
    ).toStrictEqual(['console.log', 'console.info', ';;']);
    expect(
      unpack({
        tabs: [
          {name: 'HTML', configuration: {value: '<html></html>'}},
          {name: 'SCRIPT1', configuration: {value: 'console.log'}},
          {name: 'SCRIPT2', configuration: {value: "console.info('some info here')"}},
          {name: 'SCRIPT3', configuration: {value: ';abc;'}},
          {
            name: 'SCRIPT4',
            configuration: {
              value: `if (myBool) {
            plzRunThis()
          } else {
            plzDontRunThis()
          }
          console.log('lol')
          label: for (let i = 5; i <= 10; i++) {
            console.log('lol', i)
          }`
            }
          },
          {
            name: 'SCRIPT6',
            configuration: {
              value: `module.exports = {
                mySettingsRoot: {
                  "settings": {
                    "versionRoot": {
                      "version": 26
                    }
                  }
                }
              }`
            }
          },
          {name: 'STYLE1', configuration: {value: 'body{}'}},
          {name: 'STYLE2', configuration: {value: 'body,html{}'}},
          {name: 'STYLE4', configuration: {value: 'body,html{}'}}
        ]
      }).scripts
    ).toStrictEqual([
      'console.log',
      "console.info('some info here')",
      ';abc;',
      `if (myBool) {
            plzRunThis()
          } else {
            plzDontRunThis()
          }
          console.log('lol')
          label: for (let i = 5; i <= 10; i++) {
            console.log('lol', i)
          }`
    ]);
  });

  test('returned content contains styles', () => {
    expect(
      unpack({
        tabs: [
          {name: 'HTML', configuration: {value: '<html></html>'}},
          {name: 'SCRIPT1', configuration: {value: 'console.log'}},
          {name: 'STYLE1', configuration: {value: 'body{}'}}
        ]
      }).styles
    ).toStrictEqual(['body{}']);
    expect(
      unpack({
        tabs: [
          {name: 'HTML', configuration: {value: '<html></html>'}},
          {name: 'SCRIPT1', configuration: {value: 'console.log'}},
          {name: 'STYLE1', configuration: {value: 'body,html{margin:15px;}'}},
          {name: 'STYLE1', configuration: {value: 'body,html,a{margin:15px;}'}}
        ]
      }).styles
    ).toStrictEqual(['body,html{margin:15px;}']);
  });
});
