# kpsdk-solver
> A Playwright-based solver for Kasada's bot defense platform.

Available as a replacement to Playwright's `BrowserContext.newPage()` and `Browser.newPage()`

## Features
- Extensive manipulation of the Kasada SDK
  - Use custom script import
  - Use custom configuration
  - Inspect SDK messages
  - Interact with Kasada's Fetch API
  - Use same-page client token regeneration
- Support for CommonJS (CJS) and ECMAScript (ESM) module use
- Seamless integration with the Playwright library

## Limitations
- Does not work with Puppeteer
- Fails to bypass detection on Chrom(e/ium) browsers
- Fails to bypass detection on most Linux machines

## Installation
```sh
npm install kpsdk-solver
```

## Usage
```js
import playwright from 'playwright';
import Solver from 'kpsdk-solver';
const solver = new Solver(config);

(async () => {
  const browser = await playwright.firefox.launch({ headless: true });
  const context = await browser.newContext();

  const page = await solver.create(context, page => {
    // completely optional; access the page instance before the solver uses it
    console.log(page.url()); // should return about:blank or smthn
  });

  // solver entrypoint!
  console.log(page.solver);

  // retrieve the SDK messages
  console.log(page.solver.messages); // KPSDK:DONE:...

  // make a modifiable fetch request
  const { route, request } = await fetch('/api/kasada-protected-endpoint');
  //// refer to playwright.dev/docs/api/class-request
  console.log(request.headers()); // capture the x-kpsdk-* headers of that request
  //// refer to playwright.dev/docs/api/class-route
  await route.abort(); // abort unless same-page client token regeneration should be used
  
  await context.close();
  await browser.close();
})();
```

## Configuration
```js
{
  kasada: {
    // `configuration` specifies which endpoints Kasada should protect
    // passed to window.KPSDK.configure()
    configuration: [{
      domain: 'some-domain.com',
      method: 'POST',
      path: '/api/kasada-protected-endpoint',
      protocol: 'https:'
    }],

    // `sdk-script` specifies the Kasada SDK script to import
    // passed to Page.addInitScript()
    // see available options at playwright.dev/docs/api/class-page#page-add-init-script-option-script
    'sdk-script': {
      url: 'https://some-domain.com/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/p.js'
    }
  },

  parent: {
    // `load-complete` indicates whether or not to fully load the target page
    // Kasada SDK options do not need to be specified when this option is enabled
    // when disabled, the target page is loaded as a blank page to reduce loading latency
    'load-complete': false, // default

    // `url` specifies the target page URL which the browser will navigate to
    // this affects the Referer and Origin headers of requests, as well as other origin-dependant browser properties
    // HTTP redirects are still considered when `load-complete` is disabled
    url: 'https://some-domain.com'
  }
}
```
