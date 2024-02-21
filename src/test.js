const KPSDK_SOLVER = require('./index.js');

(async () => {
  const {
    close,
    fetch, // create and analyze requests, as well as modify their responses, all using the Fetch API within the page
    KPSDK_message

  } = await KPSDK_SOLVER({
    kasada: {
      configuration: [{
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
      sdk_script_url: 'https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/p.js',
    },

    // controls the Origin and Referer headers of requests, as well as the window.location object of the page.
    parent_url: 'https://sdk.vercel.ai'
  });

  console.log(KPSDK_message);

  // no need to use the endpoint as intended, just make Kasada generate the x-kpsdk-* headers
  const {
    route,
    request
  } = await fetch('https://sdk.vercel.ai/api/generate', {
    method: 'POST'
  });

  // we can capture the x-kpsdk-* headers from the request
  // see https://playwright.dev/docs/api/class-request for a reference on Playwright's Request class
  console.log(request.headers());


  // see https://playwright.dev/docs/api/class-route for a reference on Playwright's Route class
  // not suggested to use route.abort() - same-page client token regeneration will not function correctly
  await route.continue();

  await close(); // gracefully close down the browser
})();
