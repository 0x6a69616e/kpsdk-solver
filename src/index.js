const { firefox } = require('playwright');

// configuration for the Kasada SDK
const config = [
  {
    path: '/api/generate',
  },
  {
    path: '/api/prompt'
  }
]

// endpoints are under the same domain
.map(endpoint => (endpoint.domain = 'sdk.vercel.ai', endpoint))

// endpoints use the POST method
.map(endpoint => (endpoint.method = 'POST', endpoint));


(async () => {
  const browser = await firefox.launch({
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // https://stackoverflow.com/questions/75754759/change-navigator-webdriver-with-playwright
  await page.addInitScript("delete Object.getPrototypeOf(navigator).webdriver");

  await page.goto('view-source:https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3');

  await page.evaluate(() => {
    document.head.outerHTML = document.body.outerHTML = "";
  });

  await page.addScriptTag({
    url: 'https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/p.js'
  });

  // configure the Kasada SDK and wait until it's ready; capture the KPSDK.message for analysis
  const KPSDK_message = await page.evaluate(config => {
    return new Promise(res => {
      let KPSDK_message;

      window.addEventListener('message', ({
        data
      }) => !data.startsWith('KPSDK:DONE:') || (KPSDK_message = data));
      window.addEventListener('kpsdk-ready', () => !KPSDK.isReady() || res(KPSDK_message));
      window.KPSDK.configure(config);
    });
  }, config);

  // at this point, the Kasada SDK is ready for use!
  console.log(`\nready on ${new Date(Date.now()).toLocaleString()}!\n${KPSDK_message}\n`);

  await browser.close();
})();
