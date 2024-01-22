const part1 = require('./modules/part-1.js');
const part2 = require('./modules/part-2.js');

(async () => {
  // obtains the KPSDK message
  const message = await part1();
  
  // processes the KPSDK message to return ct (client token), cd (challenge data), and v (version) headers
  const kpsdk = part2(message);
  
  console.log(kpsdk);
})();
