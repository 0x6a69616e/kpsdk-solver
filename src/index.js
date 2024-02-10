const {
  close,
  get_browser,

  get_message
} = require('./modules/part-1.js');
const part2 = require('./modules/part-2.js');


(async () => {
  const [ context ] = await get_browser();
  
  const KPSDK_message = await get_message('https://sdk.vercel.ai');
  
  const KPSDK = part2(...KPSDK_message.data);
  const cookies = await context.cookies();

  console.log(KPSDK_message, KPSDK, cookies);

  await close();
})();
