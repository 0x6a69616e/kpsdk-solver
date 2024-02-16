# kpsdk-solver
[WIP] Semi-reverse-engineered Kasada Bot Protection.

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


## File Structure
```
.
├── kpsdk/
│   ├── p.js
│   ├── p_deobf.js
│   └── p_deobf_modified.js
├── src/
│   ├── modules/
│   │   ├── part-1.js
│   │   └── part-2.js
│   └── index.js
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```
- `./kpsdk/p.js` - Original snapshot of Kasada's `p.js` script
- `./kpsdk/p_deobf.js` - Deobfuscated `./kpsdk/p.js` for script analysis and reference
- `./kpsdk/p_deobf_modified.js` - Modified `./kpsdk/p_deobf.js` to expose the internal variables and functions of the script to the global scope. Minified for efficient synchronous file processing with [`fs.readFileSync()`](https://github.com/0x6a69616e/kpsdk-solver/blob/51ee22b3c255e97ebdd31d9d1ba8320f4d6bc1fc/src/modules/part-2.js#L18)
- `./src/modules/part-1.js` - Obtains `KPSDK.message`
- `./src/modules/part-2.js` - Processes `KPSDK.message`, returns `kpsdk-*` values


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
