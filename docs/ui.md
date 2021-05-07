# Navigating Site

The `epack` site is the main spot for developing, deploying, creating, etc. panels and sidebars. This is a quick documentation on how to navigate the site.

## Main Usage

When [starting up and entering](setup.md) the site at first, an interface like the following should be seen:

![Beginning Page](img/begin.png)

At the bottom right is the create panel button. When clicking on this, a popup like the following will appear:

![Create Popup](img/createPopup.png)

The UI on the `epack` site mainly uses dialogs and popups that allow actions to be performed.
When clicking on `Template > Hello World`, an IDE allowing you to edit the program will appear like the following:

![IDE](img/ide.png)

This IDE allows to edit the scripts and styles. Let's go over the `Hello World` program.

## Hello World Program

Here is the HTML inside the `Hello World` template:

```html
<html>
  <head>
    <script>
      // You can add an inline script
    </script>
    <style>
      /*
            You can also add in CSS in your HTML
      */
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This was in the HTML file</p>
  </body>
</html>
```

The `<script>` and `<style>` tags can contain inline scripts and styles. The `<h1>` and `<p>` tags contain some text that will appear in the panel.

Here is the CSS inside the template:

```css
/*
    This will make all the <p> tags red
*/

p {
  color: red;
}
```

This simply turns all of the `<p>` tags inside the template red.
This means that the "This was in the HTML file" previously mentioned in the HTML file will turn red.

Next, is the script:

```javascript
/* eslint-disable line-comment-position */

// Let’s add in some HTML through this script
document.write('<p>I was added in through the script!</p>'); // 1

// This will also put a <p> tag with the current DevTools theme
document.write('<p>Theme: ' + chrome.devtools.panels.themeName + '</p>'); // 2

// Now to stop writing and close the document
document.close(); // 3
```

At part 1, the script just writes some text to the DOM (Document Object Model). The next part adds in the theme name to the DOM.
Finally, on part 3, the DOM is closed, this is generally a good practice.
