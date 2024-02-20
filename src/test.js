const { firefox } = require('playwright');

// in courtesy of https://stackoverflow.com/a/41854075
function name_function(name, body) {
  return {[name](...args) {return body.apply(this, args)}}[name]
}

// in courtesy of https://stackoverflow.com/a/27872144
const randomString = (n, r='') => {
  while (n--) r += String.fromCharCode((r=Math.random()*62|0, r+=r>9?(r<36?55:61):48));
  return r;
};

const config = {
  solver: {
    parent_url: 'view-source:https://sdk.vercel.ai'
  },

  kasada: {
    endpoints: [
      {
        domain: 'sdk.vercel.ai',
        method: 'POST',
        path: '/api/generate',
      },
      {
        domain: 'sdk.vercel.ai',
        method: 'POST',
        path: '/api/prompt'
      }
    ],
    sdk_script: 'https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/p.js' 
  },

  playwright: {
    browser: {
      headless: true
    },
    context: undefined,
    page: undefined
  }
};

(async () => {
  const
    browser = await firefox.launch(config.playwright.browser),
    context = await browser.newContext(config.playwright.context),
    page = await context.newPage(config.playwright.page);

  // in courtesy of https://stackoverflow.com/a/75771301
  await page.addInitScript('delete Object.getPrototypeOf(navigator).webdriver');

  await page.goto(config.solver.parent_url);
  await page.evaluate(() => document.head.outerHTML = document.body.outerHTML = "");
  await page.addScriptTag({
    url: config.kasada.sdk_script
  });

  const KPSDK_message = await page.evaluate(config => {
    return new Promise(res => {
      let KPSDK_message;

      window.addEventListener('message', ({
        data
      }) => !data.startsWith('KPSDK:DONE:') || (KPSDK_message = data));
      window.addEventListener('kpsdk-ready', () => !KPSDK.isReady() || res(KPSDK_message));
      window.KPSDK.configure(config);
    });
  }, config.kasada.endpoints);

  console.log(`KPSDK.message = ${KPSDK_message}\n`);

  // make a fetch request from within the page itself and obtain the request and response headers
  const fetch = (...fetchArgs) => new Promise(async resolve => {
    const url = fetchArgs[0];
    
    // using unique handler names for page.route() and page.unroute() avoids routing mix-ups in case fetch() is called frequently
    const named_function = name_function('_' + randomString(32), async function (route, request) {

      // modify the request's response here
      // see a full list of routing methods at https://playwright.dev/docs/api/class-route#methods

      route.continue(); // continues the request

      const response = await request.response();
      await page.unroute(url, named_function);

      resolve({
        response: response.headers(),
        request: request.headers()
      });
    });

    await page.route(url, named_function);

    await page.evaluate(args => window.fetch(...args), fetchArgs);
  });

  // select an endpoint of your choice
  const { domain, path, method } = config.kasada.endpoints[0];
  
  const headers = await fetch('https://' + domain + path, {
    method
  });
  console.log(headers);

  // gracefully close the browser
  await context.close();
  await browser.close();
})()
