const { firefox } = require('playwright');

module.exports = async function () {
  const
    browser = await firefox.launch({
      headless: true
    }),
    context = await browser.newContext(),
    page = await context.newPage();
  
  await page.goto('view-source:https://sdk.vercel.ai');
  
  const
    { _preview: message } = await page.evaluateHandle(() => new Promise(async resolve => {
      window.addEventListener('message', ({ data }) => {
        if (data.startsWith('KPSDK:DONE:')) resolve(data);
      });
      
      const iframe = document.createElement('iframe');
      iframe.src = 'https://sdk.vercel.ai/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/fp?x-kpsdk-v=j-0.0.0';
      
      iframe.style.width = iframe.style.height = iframe.style.border = '0';
      iframe.style.display = 'none';
      iframe.id = 'iframe';
      
      document.body.append(iframe);
    })),
    endTime = Date.now();
  
  await page.close();
  await context.close();
  await browser.close();
  
  return {
    endTime,
    message
  };
}
