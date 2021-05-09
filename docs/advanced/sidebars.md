# Sidebars

Sidebars are another feature avaliable inside Chrome DevTools that let
you create little side sections with more content on the well known
Elements and Sources Panel. If you want to create a sidebar in `epack`,
just click on Settings > Panel Settings > Danger Zone > Convert to Sidebar.
This will convert the panel into a sidebar. This will of course bring
another set of settings for you. There are three types of sidebars:

- Expressions
- JSON
- HTML

Expression sidebars allow you to give an expression, such as `"n"` and
that expression will be continuously evaluated and update the sidebar.
JSON sidebars let you give plain JSON, and allow that to be rendered.
The two of them are not supported in the UI, but can be made using
[DevTools Scripts](../advanced/devtools-script.md). HTML sidebars, however
are supported in the UI and is exactly what comes up when you deploy
a sidebar converted from a panel.
