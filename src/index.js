// in courtesy of https://stackoverflow.com/a/41854075
function nameFunction(name, body) {
  return {
    [name](...args) {
      return body.apply(this, args)
    }
  } [name]
}

function makeId(len = 32) {
  return Array.from(Array(len)).map(x => Math.random().toString(16).slice(2, 3)).join('');
}

function build(config) {
  return async (context, page_cb) => {
    if (!context || context.constructor.name !== 'BrowserContext') throw new Error('a BrowserContext was not provided. received ' + context?.constructor.name || typeof context);
    const page = await context.newPage();

    function fetch(url, options = {}) {
      return new Promise(async (resolve, {
        trace_id = makeId(),
        fn
      }) => {
        await page.route(url, fn = nameFunction('_' + makeId(), async (route, request) => {
          if (request.headers()['x-trace-id'] !== trace_id) return;
          resolve({
            request,
            route
          });
          if (page.isClosed) return;
          await request.response();
          await page.unroute(url, fn);
        }));

        try {
          await page.evaluate(args => window.fetch(...args), [
            url,
            {
              ...options,
              headers: {
                ...options.headers,
                'X-Trace-Id': trace_id
              }
            }
          ]);
        } catch (_) {};
      });
    };

    await page.route('*/**', async function handler(route) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        status: 200,
        body: ''
      });
      await page.unroute('*/**', handler);
    });

    await page.goto(config.parent_url, {
      waitUntil: 'commit'
    });

    !(typeof page_cb === 'function') || await page_cb(page);
    await page.addScriptTag(config.kasada.sdk_script);
    const fp_listener = async res => {
      if (/\/149e9513-01fa-4fb0-aad4-566afd725d1b\/2d206a39-8ed7-437e-a3be-862e0f06eea3\/fp/.test(res.url())) {
        if (!(await res.body()).length) throw new Error(res.url() + ' responded with no body');
      }
    };

    page.on('response', fp_listener);
    const messages = await page.evaluate(config => new Promise(resolve => {
      let msgs = [];
      window.addEventListener('message', ({
        data,
        origin
      }) => !data.startsWith('KPSDK:DONE:') || msgs.push({
        message: data,
        timing: {
          ms: performance.now(),
          ts: Date.now()
        },
        origin
      }));
      window.addEventListener('kpsdk-ready', () => !KPSDK.isReady() || resolve(msgs), {
        once: true
      });
      window.KPSDK.configure(config);
    }), config.kasada.configuration);
    page.removeListener('response', fp_listener);

    return (page.solver = {
      fetch,
      messages
    }, page);
  }
}

function KPSDK_SOLVER(config) {
  return {
    create: build(config)
  }
}

export { KPSDK_SOLVER as default };
