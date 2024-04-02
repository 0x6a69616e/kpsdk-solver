# kpsdk-solver
> A Playwright-based solver for Kasada's bot defense platform.

Available as a replacement to [`Browser.newPage()`](https://playwright.dev/docs/api/class-browser#browser-new-page) and [`BrowserContext.newPage()`](https://playwright.dev/docs/api/class-browsercontext#browser-context-new-page)

## Features
- Extensive manipulation of the Kasada SDK
  - Use custom script import
  - Use custom configuration
  - Inspect SDK messages
  - Interact with Kasada's Fetch API
  - Use same-page client token regeneration
- Support for CommonJS (CJS) and ECMAScript module (ESM) use
- Seamless integration with the Playwright library

## Limitations
- Incompatible with Puppeteer
- Fails to bypass detection on... (based on common occurrences - results may vary!)
  - Chrom(e/ium) browsers; Firefox preferred [[article]](https://substack.thewebscraping.club/i/108229509/playwright-with-firefox) [[article]](https://substack.thewebscraping.club/i/99643353/the-tests-results) [[image]](https://substack-post-media.s3.amazonaws.com/public/images/f178b49a-6646-43f6-abe4-b09e3341f844_1178x225.png)
  - Most Linux machines; Windows preferred

## Installation
```sh
$ npm install kpsdk-solver
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

  // retrieve the SDK messages
  console.log(page.solver.messages); // KPSDK:DONE:...

  // make a modifiable fetch request
  const { route, request } = await fetch('/api/kasada-protected-endpoint');
  /// refer to playwright.dev/docs/api/class-request
  console.log(request.headers()); // capture the x-kpsdk-* headers of that request
  /// refer to playwright.dev/docs/api/class-route
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
    // passed to Page.evaluate() => window.KPSDK.configure()
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
