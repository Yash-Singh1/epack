# extpark

extpark (**EXT**ension **PARK**) is a simple to use GUI interface that provides with an easier way to make extensions. Currently it is focused on making chrome devtools extensions but has plans to expand later.

## Documentation

### Running Locally

- Go to the `www/` directory and run `npm run test`.
- Now the site will be running on `http://localhost:1534/index.html`.
- Open up `chrome://extensions`.
- Enable developer mode in the top right.
- Now click on "Load unpacked" in the top left. Select the `web-ext/` directory on the root of this repository.
- Copy the ID of the resulting extension.
- Go back to the site and run `localStorage.setItem("extensionid", "EXTENSION_ID")`. Replace `EXTENSION_ID` with the ID that you copied.

Now the setup is complete and the site and extension should be up and running!

### Directory Structure

The `web-ext/` directory contains the extension while the `www/` directory contains the site.

### Architecture

The site provides a UI for the user to code in the IDE and create panels. When the user deploys their panels, all of the data is sent to the extension. The extension then takes this request's data and places it into the `syncStorage`. Whenever a new instance of Chrome DevTools is created, the panels are rendered inside there.

## Contributing

Contributions are greatly welcomed!
