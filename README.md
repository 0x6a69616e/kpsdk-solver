# kpsdk-solver
A functional solver for [Kasada](https://www.kasada.io/)'s bot mitigation service.

## Getting Started
```
git clone https://github.com/0x6a69616e/kpsdk-solver.git
npm install
npx playwright install firefox
npm run start
```


## Notes
- With cookies enabled, an initial request to `/fp` returns a status 429. Subsequent requests will return a status 200.
  - `/fp` will run a browser fingerprinting script at `/ips.js` if the received status code is a 429.
  - `/fp` will directly send a pre-generated `KPSDK.message` (without the need for fingerprinting) if the received status code is a 200.
- Validity can be determined by `KPSDK.message`
  - `KPSDK.message` is parsed into 4 useful chunks of data.
    ```md
    KPSDK:DONE:<encodedClientToken>::<cryptoChallengeEnabled>:2:<serverTime>:<reinterrogationTimeoutDuration>
    ```
  - Requests to Kasada-protected endpoints are observed to succeed when `reinterrogationTimeoutDuration` is present.
  - `reinterrogationTimeoutDuration` is not present if the `/fp` iframe is improperly configured.


## Contents
```
.
├── kpsdk/
│   ├── p.js
│   ├── p_deobf.js
│   └── p_deobf_modified.js
├── src/
│   ├── index.js
│   ├── kasada_internals.js
│   └── test.js
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```
### kpsdk
- `p.js` - Original snapshot of Kasada's SDK script.
- `p_deobf.js` - Deobfuscated `p.js` for script analysis and reference.
- `p_deobf_modified.js` - Modified `p_deobf.js` to expose the internal variables and functions of the script to the global scope. Minified for efficient synchronous file processing.
### src
- `index.js` - The core module of kpsdk-solver itself.
- `kasada_internals.js` - An export of Kasada's internal modules taken from `kpsdk/p.js`
- `test.js` - An example usage of kpsdk-solver against the Vercel AI Playground.


## Useful Resources
A collection of resources I've used to gain a thorough understanding of Kasada's inner workings.
- [digipres.club - moralrecordings: "Urgh. Sometime back in Septemb…"](https://digipres.club/@moralrecordings/109494350891524509)
- [Kasada p.js (x-kpsdk-cd, x-kpsdk-cd, integrity) - CodeBuug](https://www.codebuug.com/cs135253952)
- nullpt.rs
  - [Devirtualizing Nike.com's Bot Protection (Part 1) | nullpt.rs
](https://www.nullpt.rs/devirtualizing-nike-vm-1)
  - [Devirtualizing Nike.com's Bot Protection (Part 2) | nullpt.rs
](https://www.nullpt.rs/devirtualizing-nike-vm-2)
- [streamlink/streamlink#5380 (comment)](https://github.com/streamlink/streamlink/issues/5380#issuecomment-1599433861)
- substack.thewebscraping.club
  - [How to by-pass Kasada bot mitigation?](https://substack.thewebscraping.club/p/how-to-by-pass-kasada-bot-mitigation)
  - [THE LAB #11: The Anti-Detect Anti-Bot matrix](https://substack.thewebscraping.club/p/anti-detect-anti-bot-matrix)
  - [What is Kasada bot mitigation? - by Pierluigi Vinciguerra](https://substack.thewebscraping.club/p/what-is-kasada-bot-mitigation)
- [Twitch stopped to recgonise the browser independent of configuration - Orion Public Issue Tracker](https://orionfeedback.org/d/4601-twitch-stopped-to-recgonise-the-browser-independent-of-configuration/13)
