
<h1 align="center">
  GitOwl Browser Extension
</h1>

<h3 align="center">
  <b><a href="https://gitowl.dev">gitowl.dev</a></b>
  <span> • </span>
  <b><a href="https://chrome.google.com/webstore/detail/gitowl/gijnkijpbdlefjnobncjfongkbpoohdb">chrome</a></b>
  <span> • </span>
  <b><a href="https://addons.mozilla.org/en-US/firefox/addon/gitowl/">firefox</a></b>
</h3>

![Screenshot](./screenshots/main.png)

GitOwl browser extension adds a sidebar to GitHub, NPM & PyPI with contextual insights.

The extension code itself is kept to a minimum, to maintain privacy and ease of review.
The insights are provided by the `gitowl.dev` iframe, which is embedded in the sidebar and doesn't have access to the content of the page.

The extension is only responsible for:
- Controlling the sidebar state
- Identifying the entity being viewed
- Instantiating the iframe
- Passing the entity name to the iframe

## Architecture

Extension consists of the [content script](./src/content/index.tsx) and the [frame](./src/frame/index.html) page.

Content script:
- runs in the context of the page
- creates & controls the sidebar
- identifies the entity being viewed
- instantiates frame.html as an iframe
- posts messages to iframe if the entity changes

The frame page simply contains the iframe to `gitowl.dev` and relays messages from the content script.
This frame is needed to prevent issues with embedding iframe with a different origin.

## Development

1. Install dependencies
```shell
$ npm install
```

2. Run the dev script
```shell
$ npm run dev
```

The extension preview will be available at `http://localhost:5173`. Alternatively, it can also be loaded as an unpacked extension (see below).

### Loading the extension (Chrome)

```shell
# Builds the extension and watches for changes
$ npm run build:watch
```

- Open the Extension Management page by navigating to `chrome://extensions`.
- Enable Developer Mode by clicking the toggle switch next to Developer mode.
- Click the `LOAD UNPACKED` button and select the `dist` directory.
- Note: there is no automatic reloading, so you will need to manually reload the extension to see changes.


## Build & Pack

The build script simply bundles the extension and zips the contents of the `dist` directory.

```shell
$ ./scripts/create-release.sh
```
