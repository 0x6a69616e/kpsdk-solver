const
  fs = require('fs'),
  {
    JSDOM
  } = require('jsdom');

const {
  window
} = new JSDOM('', {
  runScripts: 'dangerously'
});

const {
  KPSDK,
  _0x3fa0dc,
  _0x26c6c1,
  _0x147b85
} = (window.eval(fs.readFileSync('kpsdk/p_deobf_modified.js', 'utf-8')), window);

module.exports = (arr => arr.reduce((acc, num) => (acc[num] = _0x147b85[num].exports, acc), Array(Math.max(...arr))))(Object.keys(_0x147b85).sort().map(Number));
