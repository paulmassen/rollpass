# Rollpass

Generates passwords designed to be **typed very fast**: alternating fingers (or hands), no crossed fingers, tuned to your keyboard layout, including **one-handed**.

<!-- ![Rollpass screenshot](docs/screenshot.png) -->

## Features

- **Layouts**: QWERTY, AZERTY, QWERTZ, Dvorak
- **Two hands**: favors left / right alternation
- **One hand** (left or right): **index pivot** mode. The index finger stays on the bottom row and alternates with the ring, middle and pinky fingers (in a random order each cycle), for example `index → ring → index → middle → index → pinky`. No crossed fingers, the hand barely moves
- **Unique keys** with two hands (a and A count as the same key). With one hand, only the index keys (2 on its row) come back, never twice in a row; the other fingers avoid repeats as long as free characters remain
- **Easy to type**: no dead keys (`^`, `¨`…) on AZERTY and QWERTZ; on AZERTY nothing that needs Shift except capital letters (so no digits there), and the comma is the only available symbol; `a–z` means plain ASCII letters
- **Visualization** of the path on the keyboard, plus a flow score
- **Practice mode**: time yourself typing the generated password
- **Strength**: an entropy estimate is shown for every generation
- **FAQ**: an honest one, with a straight face (mostly)
- Works offline (PWA) and is 100% local: nothing is sent to a server, no external fonts or scripts

## ⚠️ Security: read this

A password that is easy to type is **mechanically weaker** than a fully random one. The constraints (alternating fingers, unique keys, restricted rows) reduce the number of possible combinations.

Rollpass therefore displays an **estimated entropy**, computed conservatively by assuming the attacker knows the tool *and* your settings. With the default settings (12 characters, letters, home + top rows) you are around **20 to 25 bits**. That is **weak**: fine for unlocking a device protected by a brute-force delay, not for protecting an online account.

Keep in mind:

- For an important account, use a **password manager** with a long random password.
- If you use Rollpass anyway, **increase the length** and open up rows and character sets until the gauge looks acceptable. Aim for 60 bits or more for serious use.
- Randomness comes from `crypto.getRandomValues()` (never `Math.random()`).

### How entropy is estimated

The generator draws each character with weights (comfort, index ↔ middle / pinky rhythm, hand alternation).

- **Two hands**: it makes 64 draws and keeps the best one. The estimate is the average "surprise" (−log₂ of the probability of each choice) over those draws, minus log₂(64) = 6 bits to account for picking the best.
- **One hand (pivot)**: the password is a single draw, with no "best of" selection. Entropy is the average surprise over 64 independent draws.

In both cases this is a Shannon entropy estimate, not a strict mathematical bound.

## Run locally

```bash
npm install
npm run dev
```

Other commands:

```bash
npm test          # generator tests (Vitest)
npm run lint      # oxlint
npm run build     # type-check + production build into dist/
npm run preview   # preview the build
```

## Deploy to GitHub Pages

The build uses relative paths, so it works both under `https://<user>.github.io/rollpass/` and at the root of a domain.

1. Create the GitHub repository and push the code:
   ```bash
   git remote add origin git@github.com:<user>/rollpass.git
   git push -u origin main
   ```
2. Publish (lint, tests and build run first, then `dist/` is pushed to the `gh-pages` branch):
   ```bash
   SITE_URL=https://<user>.github.io/rollpass npm run deploy
   ```
   `SITE_URL` is optional but recommended: it adds the absolute URLs needed for share previews (`og:url`, `og:image`, `canonical`).
3. In the repository's *Settings → Pages*, choose *Deploy from a branch* → `gh-pages` / `/ (root)`.

Vercel, Netlify, Cloudflare Pages and friends work too: just publish `dist/`. The `vercel.json` file adds security headers (CSP, HSTS…). GitHub Pages does not allow custom headers, so the CSP is injected as a `<meta>` tag at build time.

## Stack

Vite · React · TypeScript · Vitest. Self-hosted fonts via Fontsource.

## Support

If Rollpass made your unlock smoother: [Buy me a coffee](https://www.buymeacoffee.com/paulmassendari) or [support on Ko-fi](https://ko-fi.com/paulmassendari). Made by [Paul Massendari](https://github.com/paulmassen) ([LinkedIn](https://www.linkedin.com/in/paul-massendari/)).

## License

[MIT](LICENSE)
