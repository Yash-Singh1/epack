# Setting Up

This documentation will go over setting up `epack`.

## Installing extension

Install the chrome extension from: <https://chrome.google.com/webstore/detail/epack/nokogfhgpmlaimjemjdjgfccelpipacn>

## Using Site

- The site is at [`https://epack.js.org/playground/`](https://epack.js.org/playground/)
- Open up `chrome://extensions` (Skip to copying the ID if you installed the extension)
- Enable developer mode in the top right
- Now click on "Load unpacked" in the top left. Select the `ext/` directory on the root of this repository
- Copy the ID of the resulting extension
- Go back to the site and paste the extension ID you copied in the prompt

## Running Locally

- Run `npm run start` at the root of the repository
- Now the site will be running on [`http://localhost:1534/playground/`](http://localhost:1534/playground/)
- Open up `chrome://extensions` (Skip to copying the ID if you installed the extension)
- Enable developer mode in the top right
- Now click on "Load unpacked" in the top left. Select the `ext/` directory on the root of this repository
- Copy the ID of the resulting extension
- Go back to the site and paste the extension ID you copied in the prompt

Now the setup is complete and the site and extension should be up and running!

## Viewing Docs

### Hosted

Go to [`https://epack.js.org/`](https://epack.js.org/).

### Locally

- Run `npm run start` at the root of the repository
- The docs will be at [`http://localhost:1534/`](http://localhost:1534/)

The docs run based on [`docsify`](https://docsify.js.org/#/).

## Directory Structure

Here is the directory structure:

```sh
root/
|
|
|________ .github/ # Some configuration for Github
|
|
|________ docs/ # The docsify site
|
|
|________ img/ # Some images and assets for the docs
|
|
|________ ext/ # The main extension that creates sidebars and panels
|
|
|________ www/ # The site for epack
|
|
|________ README.md, ROADMAP.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md # Some files to help you get started!
|
|
|________ server.js, start.sh, package.sh # Help start up the servers and packaging
```

The `ext/` directory contains the extension while the `www/` directory contains the site.

## Architecture

The site provides a UI for the user to code in the IDE and creates panels.
When the user deploys their panels, all of the data is sent to the extension.
The extension then takes this request’s data and places it into the `storage.sync`.
Whenever a new instance of Chrome DevTools is created, the panels are rendered inside there.
To see the full architecture, see the [`ARCHITECTURE.md`](/ARCHITECTURE.md) at the root of this repository.

## Contributing

Contributions are greatly welcomed! Please see the [`CONTRIBUTING.md`](CONTRIBUTING.md) for more information on how to contribute.
