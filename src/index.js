// in courtesy of https://stackoverflow.com/a/41854075
function nameFunction(name, body) {
  return {
    [name](...args) {
      return body.apply(this, args)
    }
  } [name]
}

function make_id(len = 32) {
  return Array.from(Array(len)).map(() => Math.random().toString(16).slice(2, 3)).join('');
}

function build(config) {
  const rt = config?.['request-tracing'];
  const sc = config?.kasada;
  const ss = config?.['sdk-script'];
  const {
    'load-complete': lc,
    url
  } = config;

  async function create(context, page_cb) {
    const page = await context.newPage();
    typeof page_cb !== 'function' || await page_cb(page);

    async function launch_kasada() {
      await page.goto(await (async () => {
        if (lc) return url;

        const response = await page.request.get(url);
        return await page.route('*/**', async function router(route) {
          await route.fulfill({
            response,
            status: 200,
            body: ''
          });
          await page.unroute('*/**', router);
        }),
        response.url();
      })(), {
        waitUntil: 'commit'
      });

      !ss || await page.addScriptTag(ss);

      const fp_regex = /\/149e9513-01fa-4fb0-aad4-566afd725d1b\/2d206a39-8ed7-437e-a3be-862e0f06eea3\/fp/;
      const fp_endpoint_listener = res => !fp_regex.test(res.url()) || (async () => {
        if (!(await res.body()).length) throw new Error(res.url() + ' responded with no body');
      })();

      page.on('response', fp_endpoint_listener);

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
        })), window.addEventListener('kpsdk-ready', () => !KPSDK.isReady() || resolve(msgs), {
          once: true
        }), !config || window.KPSDK.configure(config);
      }), sc);

      return page.removeListener('response', fp_endpoint_listener), messages;
    }

    function fetch(url, options = {}) {
      if (sc) {
        const parsed = new URL(url);
        const endpoint = sc.find(e => (e.domain == parsed.host) && (e.path == parsed.pathname || e.path.includes('*'))) || (() => {
          throw new Error('kasada is not configured to intercept requests to ' + url);
        })();

        options.method || (endpoint.method.includes('*') || (options.method = endpoint.method));
      }

      return new Promise(async (resolve, {
        trace_header = 'X-Trace-Id',
        trace_id = rt ? make_id() : 0..a,
        fn
      }) => {
        await page.route(url, fn = nameFunction(make_id(), async (route, request) => {
          if (trace_id && (request.headers()[trace_header.toLowerCase()] !== trace_id)) return;
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
            trace_id ? {
              ...options,
              headers: {
                ...options.headers,
                [trace_header]: trace_id
              }
            } : options
          ]);
        } catch (_) {};
      });
    }

    return (page.solver = {
      fetch,
      messages: await launch_kasada(),
    }, page);
  }

  return {
    create
  };
}

export { build as default };
