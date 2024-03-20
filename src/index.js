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
    const page = await context.newPage();
    const {
      kasada: {
        configuration: sdk_config,
        'sdk-script': sdk_script
      },
      parent: {
        'load-complete': lc,
        url
      }
    } = config;
    
    typeof page_cb !== 'function' || await page_cb(page);

    await page.goto(await (async () => {
      if (lc) return url;

      // handle HTTP redirects
      const response = await page.request.get(url);
      await page.route('*/**', async function handler(route) {
        await route.fulfill({
          response,
          status: 200,
          body: ''
        });
        await page.unroute('*/**', handler);
      });
      return response.url();
    })(), lc ? {
      waitUntil: 'commit'
    } : undefined);
    
    // if load-complete is enabled, assume target page already has a p.js script to load
    lc || await page.addScriptTag(sdk_script);

    const fp_listener = res => !/\/149e9513-01fa-4fb0-aad4-566afd725d1b\/2d206a39-8ed7-437e-a3be-862e0f06eea3\/fp/.test(res.url()) || (async _ => {
      if (!(await res.body()).length) throw new Error(res.url() + ' responded with no body');
    })();

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
    }), sdk_config);
    page.removeListener('response', fp_listener);

    return (page.solver = {
      fetch(url, options = {}) {
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
      },
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
