# Events

Multiple events occur inside a Chrome DevTools Panel. `epack` allows you to listen for these events simply by defining a function in the `Window` object.
Note that these events don't trigger in sidebars.
Here is a list of callbacks and their arguments. _Brought from the official chrome.devtools documentation and MDN documentation_:

## onShown

The `onShown` event is fired when the panel is first opened. This function recieves the window object as an argument. Here is an example:

```js
window.onShown = (panelWindow) => {
  document.write(panelWindow.chrome.devtools.panels.themeName);
};
```

Which is the same as:

```js
window.onShown = (panelWindow) => {
  document.write(window.chrome.devtools.panels.themeName);
};
```

## onHidden

The onHidden event is fired when another panel window is opened, making your current panel instance not visible. It recieves no arguments.
Here is an example of listening for this event:

```js
window.onHidden = () => {
  document.write('<p>You just hid the panel!</p>');
};
```

## onSearch

The onSearch event is fired when something is searched in the panel. It recieves the action (type of search) and the query (the query of the search performed).
Here is an example of listening for the event:

```js
/**
 * onSearch event
 * @param {string} The action performed. Can be one of "performSearch", "cancelSearch", "nextSearchResult", "previousSearchResult"
 * @param {string} The query in the search
 */
window.onSearch = (action, query) => {
  document.write(`<p>${action}: ${query}</p>`);
};
```

## Booleans

There are also some booleans showing the state of the panel.

### shown

True when the panel is open and shown and false when the panel is hidden.

### hidden

True when the panel is hidden and false when the panel is open and shown.
