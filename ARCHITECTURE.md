# Architecture

This documentation is for those who are curious on how `epack` works behind the scenes in the extensions.

## Devtools Page

Quoting from Chrome's documentation:

> An instance of the extension's DevTools page is created each time a DevTools window opens.
> The DevTools page exists for the lifetime of the DevTools window.
> The DevTools page has access to the DevTools APIs and a limited set of extension APIs. Specifically, the DevTools page can:
>
> - Create and interact with panels using the devtools.panels APIs.
> - Get information about the inspected window and evaluate code in the inspected window using the devtools.inspectedWindow APIs.
> - Get information about network requests using the devtools.network APIs.

This means that whenever you open up the Chrome DevTools, the devtools page starts up.
The devtools page has access to create and edit panels, but the panels may not be dynamic.
However the way around is to use the `onShown` event.

## Using onShown

Quoting the documentation about the `onShown` event:

> The listener parameter should be a function that looks like this:
>
> ```javascript
> (window: chrome.global) => {...}
> ```
>
> `window` is the window of the panel window

Whenever the panel is first opened up, the `onShown` event that is registered fires.
`epack` takes advantage of the `window` object and adds in your dynamic HTML when the callback is run.
In all, this means that the panel first loads only when the panel is clicked on to be opened or shown.

## Inline Scripts

The main problem by doing this is the disability to adding in inline scripts into the HTML page.
Chrome however allows to create sandboxed iframes that will have less access to chrome extension APIs, but still does the job.
This means that the panel is not just your HTML page, scripts, and styles, but instead is an HTML page with an `iframe` inside it.
Here is a diagram:

![Box inside Box](img/panel.svg)
