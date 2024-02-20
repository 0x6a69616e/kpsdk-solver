const playwright = require('playwright');
let _browser;

// in courtesy of https://stackoverflow.com/a/41854075
function nameFunction(name, body) {
  return {
    [name](...args) {
      return body.apply(this, args)
    }
  } [name]
}

// in courtesy of https://stackoverflow.com/a/27872144
const randomString = (n, r = '') => {
  while (n--) r += String.fromCharCode((r = Math.random() * 62 | 0, r += r > 9 ? (r < 36 ? 55 : 61) : 48));
  return r;
};


async function KPSDK_SOLVER({
  kasada: {
    configuration,
    sdk_script_url
  },
  parent_url
}) {
  const browser = _browser || (_browser = await playwright.firefox.launch({
    headless: true
  }));

  const context = await browser.newContext();
  const page = await context.newPage();

  // in courtesy of https://stackoverflow.com/a/75771301
  await page.addInitScript('delete Object.getPrototypeOf(navigator).webdriver');

  async function fetch(...fetchArgs) {
    const url = fetchArgs[0];
    return new Promise(async resolve => {

      // avoid routing mix-ups in case fetch() is called frequently
      const named_function = nameFunction('_' + randomString(32), async function(route, request) {
        resolve({
          route,
          request
        });

        // invoking resolve() does not negate the code after it - https://stackoverflow.com/a/28896302

        if (page.isClosed) return;
        await request.response();
        await page.unroute(url, named_function);
      });

      await page.route(url, named_function);

      try {
        await page.evaluate(args => window.fetch(...args), fetchArgs);
      } catch (_) {};
    });
  };

  const handler = async route => await route.fulfill({
    status: 200,
    body: ''
  });

  await page.route('*/**', handler);
  await page.goto(parent_url);
  await page.unroute('*/**', handler);

  await page.addScriptTag({
    url: sdk_script_url
  });

  const KPSDK_message = await page.evaluate(config => {
    return new Promise(resolve => {
      let KPSDK_message;

      window.addEventListener('message', ({ data }) => !data.startsWith('KPSDK:DONE:') || (KPSDK_message = data), { once: true });
      window.addEventListener('kpsdk-ready', () => !KPSDK.isReady() || resolve(KPSDK_message), { once: true });
      window.KPSDK.configure(config);
    });
  }, configuration);

  return {
    async close() {
      await context.close();
      await browser.close();
    },
    fetch,
    KPSDK_message
  };
}

module.exports = KPSDK_SOLVER;
