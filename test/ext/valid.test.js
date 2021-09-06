const valid = require('../../ext/valid.js');

describe('valid function', () => {
  test('succeeds on empty array', () => {
    expect(valid([])).toBe(true);
  });

  test('false on non-array', () => {
    expect(valid('abc')).toBe(false);
    expect(valid(123)).toBe(false);
  });

  test('should have valid title', () => {
    expect(valid([{settings: {}}])).toBe(false);
    expect(valid([{title: '', settings: {}}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}}])).toBe(true);
  });

  test('allow multiple', () => {
    expect(
      valid([
        {title: 'abc', settings: {}},
        {title: 'bca', settings: {}},
        {title: 'blah blah blah', settings: {}}
      ])
    ).toBe(true);
  });

  test('valid content', () => {
    expect(valid([{title: 'abc', settings: {}, content: {}}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}, content: 156}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}, content: {nestedProp: 'abcd'}}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}, content: "{nestedProp: 'abcd'}"}])).toBe(true);
    expect(valid([{title: 'abc', settings: {}}])).toBe(true);
  });

  test('valid styles', () => {
    expect(valid([{title: 'abc', settings: {}, styles: {}}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}, styles: 'blah'}])).toBe(false);
    expect(valid([{title: 'abc', settings: {}, styles: ['blah']}])).toBe(true);
  });

  test('valid scripts', () => {
    expect(valid([{title: 'hey', settings: {}, scripts: {}}])).toBe(false);
    expect(valid([{title: 'hey', settings: {}, scripts: 'blah'}])).toBe(false);
    expect(valid([{title: 'hey', settings: {}, scripts: ['blah']}])).toBe(true);
  });

  test('valid settings', () => {
    expect(valid([{title: 'my title', settings: 'blah'}])).toBe(false);
    expect(valid([{title: 'my title', settings: 57_485}])).toBe(false);
    expect(valid([{title: 'my title', settings: null}])).toBe(false);
    expect(valid([{title: 'my title', settings: {}}])).toBe(true);
  });

  test('everything', () => {
    expect(
      valid([
        {title: 'my title', settings: {}},
        {title: 'hey', settings: {}, scripts: ['blah']},
        {title: 'abc', settings: {}, styles: ['blah']},
        {title: 'abc', settings: {}},
        {title: 'abc', settings: {}, content: "{nestedProp: 'abcd'}"},
        {title: 'abc', settings: {}}
      ])
    ).toBe(true);
  });
});
