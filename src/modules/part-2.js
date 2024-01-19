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

const {
  getVersion
} = _0x3fa0dc(2764 || 0xacc);

const {
  InterceptConfigManager,
  parseSDKMessage
} = _0x3fa0dc(5939 || 0x1733);

const {
  addServerOffset,
  formFieldNames,
  formFields,
  getCurrentOffset,
  headerNames,
  headers,
  requestChallenge,
  requestChallengeSync,
  solveChallenge
} = _0x3fa0dc(8145 || 0x1fd1).challengeModuleV2();

module.exports = function(message) {
  const {
    cryptoChallengeEnabled,
    encodedClientToken,
    reinterrogationTimeoutDuration,
    serverTime
  } = parseSDKMessage(message);

  addServerOffset(Date.now(), serverTime);

  return {
    cd: JSON.stringify(solveChallenge(requestChallengeSync())),
    ct: encodedClientToken,
    v: getVersion()
  };
};
