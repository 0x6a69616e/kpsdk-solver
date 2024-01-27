const { firefox } = require('playwright');

module.exports = async function () {
  const browser = await firefox.launch({
    headless: true
  });
  const page = await browser.newPage();
  
  await page.goto('about:blank');
  
  await page.evaluate(() => {
    window.addEventListener('message', ({ data }) => {
      if (data.startsWith('KPSDK:DONE:')) throw data;
    });
    
    const iframe = document.createElement('iframe');
    iframe.src = 'https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0';
    
    iframe.style.width = iframe.style.height = iframe.style.border = '0';
    iframe.style.display = 'none';
    
    document.body.append(iframe);
  });
  
  const
    message = await new Promise(resolve => page.once('pageerror', ({ message }) => resolve(message))),
    endTime = Date.now();
  
  await browser.close();
  
  return {
    endTime,
    message
  };
}
