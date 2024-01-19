const { firefox } = require('playwright');

module.exports = async function () {
  const browser = await firefox.launch({
    headless: true
  });
  const page = await browser.newPage();
  
  // using the Vercel AI Playground (sdk.vercel.ai) to generate KPSDK message
  await page.goto('https://sdk.vercel.ai');
  
  await page.evaluate('window.onmessage=()=>{throw event.data}');
  const message = await new Promise(resolve => page.once('pageerror', ({ message }) => resolve(message)));
  
  await browser.close();
  return message;
}
