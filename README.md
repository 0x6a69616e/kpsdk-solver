# kpsdk-solver
> A Playwright-based solver for Kasada's bot defense platform.

Available as a replacer for `BrowserContext.newPage()` or `Browser.newPage()`

[Kasada](https://www.kasada.io/) is a bot detection and mitigation company that offers a [frictionless and secure alternative to CAPTCHAs](https://www.kasada.io/captcha-alternative/). Despite multiple attempts, many have been unsuccessful in reverse-engineering their defenses, prompting them to turn to solvers that come at a cost. Rather than reversing Kasada's complex system entirely, we manipulate the browser that runs it. Utilizing this concept, combined with an undetectable automated browser, we can operate Kasada's SDK ourselves to generate valid `x-kpsdk-*` headers.

## Installation
```sh
npm install kpsdk-solver
```

## Usage
```js
const Solver = require('kpsdk-solver');
const playwright = require('playwright');

const solver = new Solver(config);

(async () => {
  const browser = await playwright.firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await solver.create(context, function (page) {
    // access the page instance before the solver uses it
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

## Solver Config
```js
{
  kasada: {
    // `configuration` specifies Kasada SDK configurations
    // passed to window.KPSDK.configure()
    configuration: [{
      domain: 'some-domain.com',
      method: 'POST',
      path: '/api/kasada-protected-endpoint',
      protocol: 'https:'
    }],

    // `sdk-script` specifies the SDK script to import
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
    'load-complete': false // default

    // `url` specifies the target page URL which the browser will navigate to
    // this affects the Referer and Origin headers of requests, as well as other origin-dependant browser properties
    // HTTP redirects are still considered when `load-complete` is disabled
    url: 'https://some-domain.com'
  }
}
```
