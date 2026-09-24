# Site Screenshot

`@yaboywf/site-screenshot` captures a website screenshot using Chromium and saves the same screenshot to one or more output files.

It is designed for simple automated screenshot generation during development, builds, or CI.

## Features

* Capture any website
* Configurable output directory
* Save one screenshot to multiple files
* Configurable viewport size
* Optional delay before capture
* Wait for a specific element before capture
* Configurable navigation timeout
* Full-page screenshots
* Animation control
* PNG, JPEG, and WebP output
* Typed configuration with `defineConfig`
* Rejects unknown configuration options
* No external screenshot API required

## Requirements

* Node.js 20 or newer
* npm

## Installation

```bash
npm install --save-dev @yaboywf/site-screenshot
```

## Browser installation

The package uses Playwright Chromium.

If Chromium is not already installed, run:

```bash
npx playwright install chromium
```

## Configuration

Create either:

```text
site-screenshot.config.js
```

or:

```text
site-screenshot.config.mjs
```

in your project root.

For type checking and autocomplete:

```js
// @ts-check

import {
    defineConfig
} from "@yaboywf/site-screenshot";

export default defineConfig({
    target:
        "https://example.com",

    outputDirectory:
        "public/images",

    outputs: [
        "screenshot.png"
    ]
});
```

## Example

```js
// @ts-check

import {
    defineConfig
} from "@yaboywf/site-screenshot";

export default defineConfig({
    target:
        "https://dylanyeowf.pages.dev",

    outputDirectory:
        "public/images",

    outputs: [
        "apple-touch-icon.png",
        "projects/portfolio.png"
    ],

    delay:
        1000,

    viewport: {
        width: 1440,
        height: 900
    }
});
```

This will:

```text
Open the website
↓
Wait for the page to load
↓
Wait another 1000 ms
↓
Capture one screenshot
↓
Save it to both output files
```

The page is only captured once.

The resulting screenshot buffer is reused for every configured output.

## Configuration options

### `target`

Website to capture.

Required.

```js
target:
    "https://example.com"
```

### `outputDirectory`

Base directory where screenshots are written.

Default:

```js
outputDirectory:
    "public/images"
```

Example:

```js
outputDirectory:
    "public/images"
```

with:

```js
outputs: [
    "projects/portfolio.png"
]
```

produces:

```text
public/images/projects/portfolio.png
```

Nested directories are created automatically.

### `outputs`

Files where the captured screenshot should be saved.

Default:

```js
outputs: [
    "screenshot.png"
]
```

Multiple outputs:

```js
outputs: [
    "portfolio.png",
    "projects/portfolio.png",
    "preview/portfolio.png"
]
```

The website is still captured only once.

The same screenshot is written to every output.

All outputs must use the same image format.

Supported formats:

```text
.png
.jpg
.jpeg
.webp
```

### `delay`

Additional delay before taking the screenshot.

Value is in milliseconds.

Default:

```js
delay:
    0
```

Example:

```js
delay:
    1000
```

This is useful when a page contains animations or content that appears shortly after page load.

Example flow:

```text
Page loads
↓
Wait 1000 ms
↓
Capture screenshot
```

### `viewport`

Browser viewport size.

Default:

```js
viewport: {
    width: 1440,
    height: 900
}
```

Example:

```js
viewport: {
    width: 1920,
    height: 1080
}
```

Mobile-sized viewport:

```js
viewport: {
    width: 390,
    height: 844
}
```

### `fullPage`

Capture the entire page instead of only the visible viewport.

Default:

```js
fullPage:
    false
```

Enable it with:

```js
fullPage:
    true
```

### `waitUntil`

Controls when page navigation is considered complete.

Default:

```js
waitUntil:
    "load"
```

Supported values:

```text
load
domcontentloaded
networkidle
commit
```

Example:

```js
waitUntil:
    "networkidle"
```

For most websites:

```js
waitUntil:
    "load"
```

is sufficient.

### `waitFor`

Wait for a specific element to become visible before capturing.

Default:

```js
waitFor:
    null
```

Example:

```js
waitFor:
    "[data-screenshot-ready]"
```

Your page could contain:

```html
<div data-screenshot-ready>
    Content is ready
</div>
```

The screenshot will only continue after the element becomes visible.

This is often more reliable than using a long fixed delay.

You can combine both:

```js
waitFor:
    "[data-screenshot-ready]",

delay:
    500
```

The flow becomes:

```text
Page loads
↓
Wait for element
↓
Wait another 500 ms
↓
Capture
```

### `timeout`

Maximum time allowed for page loading and element waiting.

Value is in milliseconds.

Default:

```js
timeout:
    30000
```

Example:

```js
timeout:
    10000
```

`timeout` and `delay` have different purposes.

`delay`:

```text
Wait intentionally before capture
```

`timeout`:

```text
Maximum time before giving up
```

### `animations`

Controls how animations behave during capture.

Default:

```js
animations:
    "allow"
```

Supported values:

```text
allow
disabled
```

Use:

```js
animations:
    "allow"
```

when you want animations to run normally.

For example:

```js
delay:
    1000,

animations:
    "allow"
```

lets the page animate for one second before capture.

Use:

```js
animations:
    "disabled"
```

when you want a stable final screenshot without waiting for CSS animations.

## Complete configuration

```js
// @ts-check

import {
    defineConfig
} from "@yaboywf/site-screenshot";

export default defineConfig({
    target:
        "https://example.com",

    outputDirectory:
        "public/images",

    outputs: [
        "screenshot.png"
    ],

    delay:
        0,

    viewport: {
        width: 1440,
        height: 900
    },

    fullPage:
        false,

    waitUntil:
        "load",

    waitFor:
        null,

    timeout:
        30000,

    animations:
        "allow"
});
```

You only need to specify values that differ from the defaults.

## Type-safe configuration

The package exports:

```js
defineConfig()
```

Use:

```js
// @ts-check

import {
    defineConfig
} from "@yaboywf/site-screenshot";

export default defineConfig({
    target:
        "https://example.com"
});
```

VS Code will provide autocomplete and type checking.

For example:

```js
export default defineConfig({
    target:
        "https://example.com",

    unknownOption:
        true
});
```

will be flagged because `unknownOption` is not a valid configuration property.

Unknown options are also rejected when the CLI runs.

## Usage

Capture the configured website:

```bash
npx site-screenshot
```

Or add a script:

```json
{
    "scripts": {
        "screenshot": "site-screenshot"
    }
}
```

Then run:

```bash
npm run screenshot
```

## Custom config file

Use another config file:

```bash
npx site-screenshot --config=preview.config.mjs
```

or:

```bash
npx site-screenshot --config preview.config.mjs
```

## Example project

Configuration:

```js
// @ts-check

import {
    defineConfig
} from "@yaboywf/site-screenshot";

export default defineConfig({
    target:
        "https://dylanyeowf.pages.dev",

    outputDirectory:
        "public/images",

    outputs: [
        "apple-touch-icon.png",
        "projects/portfolio.png"
    ],

    delay:
        1000,

    viewport: {
        width: 1440,
        height: 900
    }
});
```

Generated files:

```text
public/
└── images/
    ├── apple-touch-icon.png
    └── projects/
        └── portfolio.png
```

## Testing

The project uses Node.js's built-in test runner.

Run:

```bash
npm test
```

Recommended `package.json` scripts:

```json
{
    "scripts": {
        "test": "node --test",
        "verify": "node --check src/cli.js && npm test"
    }
}
```

Run all checks:

```bash
npm run verify
```

Tests should cover:

* Website capture
* Screenshot delay
* Multiple outputs
* Nested output directories
* Invalid configuration options
* Missing target
* Invalid output formats
* Viewport dimensions

## Package development

Install dependencies:

```bash
npm install
```

Install Chromium if required:

```bash
npx playwright install chromium
```

Run tests:

```bash
npm test
```

Run all verification:

```bash
npm run verify
```

Check what will be published:

```bash
npm pack --dry-run
```

Create a local package archive:

```bash
npm pack
```

## Releases

Commit your changes:

```bash
git add .
git commit -m "Update site screenshot"
```

Create a patch release:

```bash
npm version patch
```

Push the commit and tag:

```bash
git push origin main
git push origin --tags
```

Publish:

```bash
npm publish --access public
```

## Repository structure

```text
site-screenshot/
├── src/
│   ├── cli.js
│   ├── index.js
│   └── index.d.ts
├── test/
│   └── cli.test.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Recommended `.gitignore`

```gitignore
node_modules/
test-output/
*.tgz
.DS_Store
npm-debug.log*
```

## License

MIT
