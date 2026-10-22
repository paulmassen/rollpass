/** All user-facing copy. The interface is English-only. */
export const m = {
  brand: 'Rollpass',
  heroTitle: 'Passwords that type at full speed.',
  heroLede:
    'Fingers that alternate instead of tripping over each other, tuned to your keyboard. Even one-handed, for a stylish unlock.',

  controls: {
    layout: 'Layout',
    layoutAria: 'Keyboard layout',
    layoutRegions: {
      qwerty: 'US / International',
      azerty: 'France / Belgium',
      qwertz: 'Germany / Switzerland',
      dvorak: 'Typing-optimized',
    },
    handMode: 'Typing mode',
    hands: {
      both: { label: 'Two hands', hint: 'Left / right alternation' },
      left: { label: 'Left hand', hint: 'Index pivot, no crossing' },
      right: { label: 'Right hand', hint: 'Index pivot, no crossing' },
    },
    rows: 'Rows',
    rowsAria: 'Keyboard rows',
    rowScopes: {
      all: { label: 'All', hint: 'Maximum variety' },
      'home-top': { label: 'Home + top', hint: 'Fastest' },
      'home-bottom': { label: 'Home + bottom', hint: 'Little movement' },
      'top-bottom': { label: 'Top + bottom', hint: 'Without home' },
    },
    digitsOutOfReach:
      'Digits live on the number row: inactive here. Switch to “All” to include them.',
    pivotNote:
      'One hand: the index finger stays on the bottom row and alternates with the ring, middle and pinky fingers. The selected rows only apply to those three fingers, and index keys may repeat.',
    digitsNeedShift:
      'On this layout digits need Shift, so Rollpass leaves them out.',
    azertySymbols: 'On AZERTY, comma is the only smooth symbol.',
    length: 'Length',
    max: 'max',
    charset: 'Character set',
    generate: 'Generate',
  },

  password: {
    empty:
      'Configure, then generate — every character is a unique key, built for speed.',
    copy: 'Copy',
    copied: 'Copied',
    copyAria: 'Copy password',
    copyError: 'Could not copy to the clipboard.',
    generateError: 'Generation failed.',
    notEnoughKeys: (available: number, requested: number) =>
      `Not enough unique keys (${available}) for a length of ${requested}. Shorten the password or enable more characters.`,
    keyboardAria: (layout: string) => `${layout} keyboard`,
    keyTitle: (hand: 'left' | 'right', finger: string, shifted: boolean) =>
      `${hand === 'left' ? 'Left' : 'Right'} · ${finger}${shifted ? ' · Shift' : ''}`,
  },

  fingers: {
    LP: 'Left pinky',
    LR: 'Left ring',
    LM: 'Left middle',
    LI: 'Left index',
    RI: 'Right index',
    RM: 'Right middle',
    RR: 'Right ring',
    RP: 'Right pinky',
  },

  score: {
    title: 'Flow',
    replay: 'Replay the path',
    playing: 'Playing…',
    rhythm: 'Index ↔ other fingers rhythm',
    unique: 'Unique keys (excluding pivot)',
    comfort: 'Comfort (row / finger)',
    overall: 'Overall score',
  },

  security: {
    title: 'Strength',
    entropyLabel: 'Estimated entropy',
    bits: 'bits',
    strength: {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
    },
    comparison: (randomBits: number) =>
      `A fully random password of the same length over the same characters would offer about ${randomBits} bits.`,
    warning:
      'A password that is easy to type is weaker than a 100% random one: finger constraints shrink the number of possible combinations. Increase the length to compensate, and use a password manager for sensitive accounts.',
    estimateNote:
      'Conservative estimate, assuming the attacker knows Rollpass and your settings.',
  },

  training: {
    title: 'Practice',
    intro:
      'Type the password as fast as you can. The timer starts on the first character. Press Esc at any time to start over.',
    inputLabel: 'Type the password',
    placeholder: 'Type here…',
    time: 'Time',
    nextFinger: 'Next finger',
    ready: 'Ready',
    record: 'Best',
    cpm: 'cpm',
    perfect: 'Perfect.',
    finished: 'Done.',
    errors: (n: number) => `${n} error${n > 1 ? 's' : ''}`,
    retry: 'Try again',
    retryKey: 'Enter',
    reset: 'Reset',
    resetKey: 'Esc',
    shift: 'Shift',
  },

  testimonials: {
    title: 'Loved by real people',
    items: [
      {
        quote:
          'To think that not long ago, I was still typing my passwords with two hands.',
        name: 'Hélène B.',
        role: 'Lyon, formerly two-handed',
      },
      {
        quote:
          'It’s so smooth I couldn’t resist using it as my root password.',
        name: 'Kevin',
        role: 'DevOps',
      },
      {
        quote:
          'I can now unlock my laptop with one hand while holding my baguette.',
        name: 'Emily C.',
        role: 'Paris',
      },
      {
        quote:
          'I’m convinced my old password is what gave me tendonitis. Thank you, Rollpass.',
        name: 'Bernard T.',
        role: 'Right wrist, recovering',
      },
      {
        quote: 'Hackers can have my account. I get to type this.',
        name: 'Chloé',
        role: 'Optimist',
      },
      {
        quote:
          'I used Rollpass to generate my Wi-Fi password. I’m sure all my guests will love it. A gracious host thinks of everything.',
        name: 'Nina K.',
        role: 'Gracious host',
      },
      {
        quote:
          'Ever since he saw me type my password, I can tell I’ve earned my geek grandson’s respect.',
        name: 'Gérard',
        role: 'Grandfather, 78',
      },
      {
        quote: 'They see me rollin’ my password, they hatin’.',
        name: 'Lenny',
        role: 'Rollin’ since 2026',
      },
      {
        quote:
          'My desk neighbors are impressed when they see me type my password. I can tell.',
        name: 'Julien M.',
        role: 'Open space, row 3',
      },
    ],
  },

  faq: {
    title: 'FAQ',
    subtitle: 'Frequently asked, mostly by our own conscience.',
    items: [
      {
        q: 'Is it a good password?',
        a: [
          'No, probably not. Especially if someone knows you generated it with Rollpass.',
          'But have you seen how smooth it is?',
        ],
      },
      {
        q: 'Can I use it for my bank account?',
        a: [
          'Please don’t. Your bank has opinions about this, and so do we. For anything that matters, let a password manager invent something long, random and unpronounceable.',
          'Rollpass is for the passwords you type by hand, many times a day, with feelings.',
        ],
      },
      {
        q: 'So what is it actually good for?',
        a: [
          'Unlocking a laptop or a phone you type into forty times a day, where the lock screen makes brute-forcing painfully slow anyway.',
          'Typing with one hand while the other holds a coffee, a cat, a baby, or a rope. Or simply bragging about your words per minute.',
        ],
      },
      {
        q: 'Why does the strength meter say “Weak”?',
        a: [
          'Because it is, and we would rather tell you than paint a reassuring green shield on it.',
          'Every rule that makes a password pleasant to type (alternating fingers, no repeated keys, staying near the home row) also shrinks the number of passwords an attacker has to try. Smooth and unpredictable pull in opposite directions.',
        ],
      },
      {
        q: 'Why does my index finger keep coming back?',
        a: [
          'In one-hand mode your index finger is the pivot: it stays on the bottom row and hands over to the ring, middle and pinky fingers in turn. That row gives it only two keys, so they repeat.',
          'It is exactly what makes the rhythm so nice, and exactly why the entropy is so low. We did say it was a trade-off.',
        ],
      },
      {
        q: 'Where does my password go?',
        a: [
          'Nowhere. Everything happens in your browser: no server, no account, no analytics, nothing stored. Randomness comes from crypto.getRandomValues(), never Math.random().',
          'Switch your Wi-Fi off and reload: it still works. It would be awkward for us if it didn’t.',
        ],
      },
      {
        q: 'How is the entropy estimated?',
        a: [
          'We average how surprising each key choice is over many independent draws, and assume the attacker knows Rollpass and your settings. It is a Shannon-style estimate, not a mathematical guarantee.',
          'The comparison line under the gauge tells you what a fully random password of the same length would have given you. It is usually humbling.',
        ],
      },
      {
        q: 'How do I make it stronger?',
        a: [
          'Make it longer, open up more rows and turn on digits and symbols. Each step costs a bit of smoothness, which is the whole point of this FAQ.',
          'Be realistic: a typing-friendly password will rarely rival what a password manager produces. Aim for 60 bits or more if it protects anything real, and use the manager if you can.',
        ],
      },
    ],
  },

  asideNote:
    'The index finger acts as a pivot and alternates with the other fingers. Restricting to two rows (home + top) limits vertical movement.',
  footer: {
    tagline: 'Smart typing · local · nothing is sent anywhere',
    madeBy: 'Made in Paris by',
    author: 'Paul Massendari',
    supportPitch:
      'Did Rollpass make your unlock smoother? Fund the next questionable password idea.',
    links: {
      github: { label: 'GitHub', url: 'https://github.com/paulmassen' },
      linkedin: {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/paul-massendari/',
      },
      source: {
        label: 'Source code',
        url: 'https://github.com/paulmassen/rollpass',
      },
    },
    sponsors: [
      {
        label: 'Buy me a coffee',
        url: 'https://www.buymeacoffee.com/paulmassendari',
      },
      { label: 'Support on Ko-fi', url: 'https://ko-fi.com/paulmassendari' },
    ],
  },
}
