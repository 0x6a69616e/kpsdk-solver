# kpsdk-solver
> A functional solver for Kasada's bot mitigation service.

[Kasada](https://www.kasada.io/) is a bot detection and mitigation company that offers a [frictionless and secure alternative to CAPTCHAs](https://www.kasada.io/captcha-alternative/). Despite multiple attempts, many have been unsuccessful in reverse-engineering their defenses, prompting them to turn to solvers that come at a cost. However, rather than reversing Kasada's complex system entirely, we manipulate the browser that runs it. Utilizing this concept, combined with an undetectable automated browser, we can operate Kasada's SDK ourselves to generate valid `x-kpsdk-*` headers.

## Getting Started
```sh
git clone https://github.com/0x6a69616e/kpsdk-solver.git
cd kpsdk-solver
npm install
npx playwright install firefox
npm run start
```

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
- `kpsdk/p.js` - Original snapshot of Kasada's SDK script on 2024-01-09.
- `kpsdk/p_deobf.js` - Deobfuscated `p.js` for script analysis and reference.
- `kpsdk/p_deobf_modified.js` - Modified `p_deobf.js` to expose the internal variables and functions of the script to the global scope. Minified for efficient synchronous file processing.
- `src/index.js` - The core module of kpsdk-solver.
- `src/kasada_internals.js` - An export of Kasada's internal modules taken from `kpsdk/p.js`
- `src/test.js` - An example usage of kpsdk-solver against the [Vercel AI Playground](https://sdk.vercel.ai/).
