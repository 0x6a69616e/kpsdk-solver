# kpsdk-solver
Semi-reverse-engineered Kasada Bot Protection.

## Getting Started
```
git clone https://github.com/0x6a69616e/kpsdk-solver.git
npm install
npx playwright install firefox
npm run start
```

## File Structure
```
.
├── ./kpsdk/
│   ├── ./kpsdk/p.js
│   ├── ./kpsdk/p_deobf.js
│   └── ./kpsdk/p_deobf_modified.js
├── ./src/
│   ├── ./src/modules/
│   │   ├── ./src/modules/part-1.js
│   │   └── ./src/modules/part-2.js
│   └── ./src/index.js
├── ./.gitignore
├── ./LICENSE
├── ./README.md
└── ./package.json
```

## Useful Resources
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
