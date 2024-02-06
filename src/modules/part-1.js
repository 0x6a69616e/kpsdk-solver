const { firefox } = require('playwright');

var _browser, _context;

async function get_browser(launchOptions = {}) {
  const browser = _browser || (_browser = await firefox.launch(Object.assign({
    headless: false
  }, launchOptions)));

  return [
    _context || (_context = await browser.newContext()),
    browser
  ];
}

async function handle_fp(page, referer, fp_base) {
  let status;
  page.on('response', res => {
    if (res.url().includes('/fp')) status = res.status();
  });
  
  await page.goto('view-source:' + referer);

  const evaluation = await page.evaluate(() => {
    const
      _location = {},
      _navigator = {};
    
    for (var i in window.location) _location[i] = location[i];
    for (var i in window.navigator) _navigator[i] = navigator[i];

    return JSON.stringify({
      location: _location,
      navigator: _navigator
    });
  });

  const {
    _preview: message
  } = await page.evaluateHandle(fp_base_url => new Promise(async resolve => {
    window.addEventListener('message', ({ data }) => {
      if (data.startsWith('KPSDK:DONE:')) resolve(data);
    });
    
    const iframe = document.createElement('iframe');
    iframe.src = new URL(fp_base_url).origin + '/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0';
    
    iframe.style.width = iframe.style.height = iframe.style.border = '0';
    iframe.style.display = 'none';
    iframe.id = 'iframe';
    
    document.body.append(iframe);
  }), fp_base || referer);

  return {
    data: [
      message,
      Date.now()
    ],
    evaluation,
    status
  };
}

async function get_message(referer, fp_base) {
  const
    [
      context
    ] = await get_browser(),
    page = await context.newPage();

  return [
    await handle_fp(page, referer, fp_base),
    await page.close()
  ][0];
}

async function close() {
  const isInstantiated = _browser && _context;
  if (isInstantiated) (await _context.close(), await _browser.close());

  return isInstantiated;
}

module.exports = {
  close,
  get_browser,
  get_message
};
