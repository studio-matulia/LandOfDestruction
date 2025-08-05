let transformationProgress = {};
let proximityLevel = 0.5;
let glitchCount = 0;
let isGlitching = false;

// Cheat mode variables
let cheatModeActive = false;
let originalStates = {};
let shiftPressed = false;
let xPressed = false;

// Letter replacement mappings for random corruption
const letterReplacements = {
    'o': '0', 'O': '0',
    'e': '3', 'E': '3',
    'a': '@', 'A': '@',
    'i': '!', 'I': '1',
    's': '$', 'S': '$',
    't': '7', 'T': '7',
    'l': '1', 'L': '1',
    'g': '9', 'G': '9',
    'b': '6', 'B': '6',
    'z': '2', 'Z': '2',
    'h': '#', 'H': '#',
    'r': '®', 'R': '®',
    'n': 'π', 'N': 'π',
    'u': 'μ', 'U': 'μ',
    'v': '∨', 'V': '∨',
    'w': 'ω', 'W': 'Ω',
    'x': '×', 'X': '×',
    'y': '¥', 'Y': '¥',
    'c': '©', 'C': '©',
    'd': 'δ', 'D': 'Δ',
    'f': 'ƒ', 'F': 'Ƒ',
    'j': 'ʝ', 'J': 'ʝ',
    'k': 'κ', 'K': 'Κ',
    'm': '₥', 'M': '₥',
    'p': 'ρ', 'P': 'Ρ',
    'q': 'ϕ', 'Q': 'Φ'
};

// Letter-level corruption tracking
const wordCorruptionStates = {};

// Define corruption transformations for specific words
const corruptionMappings = {
    "convergent": {
        target: "c0nt!ng3nt",
        meaning: "contingent",
        steps: [
            {pos: 1, char: '0'}, // o → 0
            {pos: 4, char: '!'},  // e → !
            {pos: 7, char: '3'},  // e → 3
            {pos: 9, char: '7'}   // t → 7 (optional)
        ]
    },
    "meltdown": {
        target: "cl!m@73-ch@ng3",
        meaning: "climate-change",
        steps: [
            {pos: 0, char: 'c'}, // m → c
            {pos: 1, char: 'l'}, // e → l
            {pos: 2, char: '!'}, // l → !
            {pos: 3, char: 'm'}, // t → m
            {pos: 4, char: '@'}, // d → @
            {pos: 5, char: '7'}, // o → 7
            {pos: 6, char: '3'}, // w → 3
            {pos: 7, char: '-'}, // n → -
        ]
    },
    "anti-authoritarianism": {
        target: "@uth0rit@ri@ni$m",
        meaning: "authoritarianism", 
        steps: [
            {pos: 0, char: '@'}, // a → @
            {pos: 1, char: 'u'}, // n → u
            {pos: 2, char: 't'}, // t → t (keep)
            {pos: 3, char: 'h'}, // i → h
            {pos: 4, char: '0'}, // - → 0
            {pos: 8, char: '0'}, // o → 0
            {pos: 12, char: '@'}, // a → @
            {pos: 15, char: '@'}, // a → @
            {pos: 18, char: '$'} // s → $
        ]
    },
    "surrenders": {
        target: "r3nd3r$",
        meaning: "renders",
        steps: [
            {pos: 0, char: 'r'}, // s → r
            {pos: 1, char: '3'}, // u → 3
            {pos: 2, char: 'n'}, // r → n
            {pos: 3, char: 'd'}, // r → d
            {pos: 4, char: '3'}, // e → 3
            {pos: 5, char: 'r'}, // n → r
            {pos: 6, char: '$'}, // d → $
        ]
    },
    "sensitive": {
        target: "$ub$t@nti@t3d",
        meaning: "substantiated",
        steps: [
            {pos: 0, char: '$'}, // s → $
            {pos: 1, char: 'u'}, // e → u
            {pos: 2, char: 'b'}, // n → b
            {pos: 3, char: '$'}, // s → $
            {pos: 4, char: 't'}, // i → t
            {pos: 5, char: '@'}, // t → @
            {pos: 6, char: 'n'}, // i → n
            {pos: 7, char: 't'}, // v → t
            {pos: 8, char: 'i'}, // e → i
            {pos: 9, char: '@'}, // add @
            {pos: 10, char: 't'}, // add t
            {pos: 11, char: '3'}, // add 3
            {pos: 12, char: 'd'}, // add d
        ]
    },
    "efficient": {
        target: "@p@th3t!c",
        meaning: "apathetic",
        steps: [
            {pos: 0, char: '@'}, // e → @
            {pos: 1, char: 'p'}, // f → p
            {pos: 2, char: '@'}, // f → @
            {pos: 3, char: 't'}, // i → t
            {pos: 4, char: 'h'}, // c → h
            {pos: 5, char: '3'}, // i → 3
            {pos: 6, char: 't'}, // e → t
            {pos: 7, char: '!'}, // n → !
            {pos: 8, char: 'c'}, // t → c
        ]
    },
    "voodoo": {
        target: "bl@t@nt",
        meaning: "blatant",
        steps: [
            {pos: 0, char: 'b'}, // v → b
            {pos: 1, char: 'l'}, // o → l
            {pos: 2, char: '@'}, // o → @
            {pos: 3, char: 't'}, // d → t
            {pos: 4, char: '@'}, // o → @
            {pos: 5, char: 'n'}, // o → n
            {pos: 6, char: 't'}, // add t
        ]
    },
    "feminization": {
        target: "f3t!$h!z@t!0n",
        meaning: "fetishization",
        steps: [
            {pos: 1, char: '3'}, // e → 3
            {pos: 3, char: '!'}, // i → !
            {pos: 4, char: '$'}, // n → $
            {pos: 5, char: 'h'}, // i → h
            {pos: 6, char: '!'}, // z → !
            {pos: 8, char: '!'}, // t → !
            {pos: 9, char: '0'}, // i → 0
            {pos: 11, char: '!'}, // n → !
        ]
    },
    "lesbian": {
        target: "b!ll!0n@!r3",
        meaning: "billionaire",
        steps: [
            {pos: 0, char: 'b'}, // l → b
            {pos: 1, char: '!'}, // e → !
            {pos: 2, char: 'l'}, // s → l
            {pos: 3, char: 'l'}, // b → l
            {pos: 4, char: '!'}, // i → !
            {pos: 5, char: '0'}, // a → 0
            {pos: 6, char: 'n'}, // n → n
            {pos: 7, char: '@'}, // add @
            {pos: 8, char: '!'}, // add !
            {pos: 9, char: 'r'}, // add r
            {pos: 10, char: '3'}, // add 3
        ]
    },
    "disabling": {
        target: "3n@bl!ng",
        meaning: "enabling",
        steps: [
            {pos: 0, char: '3'}, // d → 3
            {pos: 1, char: 'n'}, // i → n
            {pos: 2, char: '@'}, // s → @
            {pos: 3, char: 'b'}, // a → b
            {pos: 4, char: 'l'}, // b → l
            {pos: 5, char: '!'}, // l → !
            {pos: 6, char: 'n'}, // i → n
            {pos: 7, char: 'g'}, // n → g
        ]
    },
    "ROM command-control": {
        target: "@! m!nd-c0ntr0l",
        meaning: "AI mind-control",
        steps: [
            {pos: 0, char: '@'}, // R → @
            {pos: 1, char: '!'}, // O → !
            {pos: 2, char: ' '}, // M → (space)
            {pos: 3, char: 'm'}, // c → m
            {pos: 4, char: '!'}, // o → !
            {pos: 5, char: 'n'}, // m → n
            {pos: 6, char: 'd'}, // m → d
            {pos: 8, char: 'c'}, // n → c
            {pos: 9, char: '0'}, // d → 0
            {pos: 11, char: 'c'}, // c → c
            {pos: 12, char: '0'}, // o → 0
            {pos: 13, char: 'n'}, // n → n
            {pos: 14, char: 't'}, // t → t
            {pos: 15, char: 'r'}, // r → r
            {pos: 16, char: '0'}, // o → 0
            {pos: 17, char: 'l'}, // l → l
        ]
    },
    "sustaining": {
        target: "d!$m@ntl!ng",
        meaning: "dismantling",
        steps: [
            {pos: 0, char: 'd'}, // s → d
            {pos: 1, char: '!'}, // u → !
            {pos: 2, char: '$'}, // s → $
            {pos: 3, char: 'm'}, // t → m
            {pos: 4, char: '@'}, // a → @
            {pos: 5, char: 'n'}, // i → n
            {pos: 6, char: 't'}, // n → t
            {pos: 7, char: 'l'}, // i → l
            {pos: 8, char: '!'}, // n → !
            {pos: 9, char: 'n'}, // g → n
            {pos: 10, char: 'g'}, // add g
        ]
    },
    "themselves": {
        target: "$h@r3h0ld3r",
        meaning: "shareholder",
        steps: [
            {pos: 0, char: '$'}, // t → $
            {pos: 1, char: 'h'}, // h → h
            {pos: 2, char: '@'}, // e → @
            {pos: 3, char: 'r'}, // m → r
            {pos: 4, char: '3'}, // s → 3
            {pos: 5, char: 'h'}, // e → h
            {pos: 6, char: '0'}, // l → 0
            {pos: 7, char: 'l'}, // v → l
            {pos: 8, char: 'd'}, // e → d
            {pos: 9, char: '3'}, // s → 3
            {pos: 10, char: 'r'}, // add r
        ]
    },
    "as": {
        target: "v@lu3 @$",
        meaning: "value as",
        steps: [
            {pos: 0, char: 'v'}, // a → v
            {pos: 1, char: '@'}, // s → @
            {pos: 2, char: 'l'}, // add l
            {pos: 3, char: 'u'}, // add u
            {pos: 4, char: '3'}, // add 3
            {pos: 5, char: ' '}, // add space
            {pos: 6, char: '@'}, // add @
            {pos: 7, char: '$'}, // add $
        ]
    },
    "Security": {
        target: "D3$truct!0n",
        meaning: "Destruction",
        steps: [
            {pos: 0, char: 'D'}, // S → D
            {pos: 1, char: '3'}, // e → 3
            {pos: 2, char: '$'}, // c → $
            {pos: 3, char: 't'}, // u → t
            {pos: 4, char: 'r'}, // r → r
            {pos: 5, char: 'u'}, // i → u
            {pos: 6, char: 'c'}, // t → c
            {pos: 7, char: 't'}, // y → t
            {pos: 8, char: '!'}, // add !
            {pos: 9, char: '0'}, // add 0
            {pos: 10, char: 'n'}, // add n
        ]
    },
    "additive": {
        target: "@dd!ct!v3",
        meaning: "addictive",
        steps: [
            {pos: 0, char: '@'}, // a → @
            {pos: 3, char: '!'}, // i → !
            {pos: 5, char: '!'}, // i → !
            {pos: 7, char: '3'}, // e → 3
        ]
    },
    "globalization-miniaturization": {
        target: "gl06@l!z@t!0n-m0n0p0l!z@t!0n",
        meaning: "globalization-monopolization",
        steps: [
            {pos: 2, char: '0'}, // o → 0
            {pos: 4, char: '@'}, // a → @
            {pos: 6, char: '!'}, // i → !
            {pos: 8, char: '@'}, // a → @
            {pos: 10, char: '!'}, // i → !
            {pos: 12, char: '0'}, // o → 0
            {pos: 14, char: '-'}, // - → -
            {pos: 15, char: 'm'}, // m → m
            {pos: 16, char: '!'}, // i → !
            {pos: 17, char: 'n'}, // n → n
            {pos: 18, char: '!'}, // i → !
            {pos: 19, char: '@'}, // a → @
            {pos: 20, char: 't'}, // t → t
            {pos: 21, char: 'u'}, // u → u
            {pos: 22, char: 'r'}, // r → r
            {pos: 23, char: '!'}, // i → !
            {pos: 24, char: 'z'}, // z → z
            {pos: 25, char: '@'}, // a → @
            {pos: 26, char: 't'}, // t → t
            {pos: 27, char: '!'}, // i → !
            {pos: 28, char: '0'}, // o → 0
            {pos: 29, char: 'n'}, // n → n
        ]
    },
    "dilation": {
        target: "3×p@n$!0n",
        meaning: "expansion",
        steps: [
            {pos: 0, char: '3'}, // d → 3
            {pos: 1, char: '×'}, // i → ×
            {pos: 2, char: 'p'}, // l → p
            {pos: 3, char: '@'}, // a → @
            {pos: 4, char: 'n'}, // t → n
            {pos: 5, char: '$'}, // i → $
            {pos: 6, char: '!'}, // o → !
            {pos: 7, char: '0'}, // n → 0
            {pos: 8, char: 'n'}, // add n
        ]
    },
    "cyberian military": {
        target: "cy63r ω@r",
        meaning: "cyber war",
        steps: [
            {pos: 2, char: '6'}, // b → 6
            {pos: 3, char: '3'}, // e → 3
            {pos: 4, char: 'r'}, // r → r
            {pos: 5, char: ' '}, // i → (space)
            {pos: 6, char: 'ω'}, // a → ω
            {pos: 7, char: '@'}, // n → @
            {pos: 8, char: 'r'}, // (space) → r
        ]
    },
    "replace": {
        target: "3nh@nc3",
        meaning: "enhance",
        steps: [
            {pos: 0, char: '3'}, // r → 3
            {pos: 1, char: 'n'}, // e → n
            {pos: 2, char: 'h'}, // p → h
            {pos: 3, char: '@'}, // l → @
            {pos: 4, char: 'n'}, // a → n
            {pos: 5, char: 'c'}, // c → c
            {pos: 6, char: '3'}, // e → 3
        ]
    },
    "tragic": {
        target: "pr0f!t@bl3",
        meaning: "profitable",
        steps: [
            {pos: 0, char: 'p'}, // t → p
            {pos: 1, char: 'r'}, // r → r
            {pos: 2, char: '0'}, // a → 0
            {pos: 3, char: 'f'}, // g → f
            {pos: 4, char: '!'}, // i → !
            {pos: 5, char: 't'}, // c → t
            {pos: 6, char: '@'}, // add @
            {pos: 7, char: 'b'}, // add b
            {pos: 8, char: 'l'}, // add l
            {pos: 9, char: '3'}, // add 3
        ]
    },
    "the populace": {
        target: "c@p!t@l",
        meaning: "capital",
        steps: [
            {pos: 0, char: 'c'}, // t → c
            {pos: 1, char: '@'}, // h → @
            {pos: 2, char: 'p'}, // e → p
            {pos: 3, char: '!'}, // (space) → !
            {pos: 4, char: 't'}, // p → t
            {pos: 5, char: '@'}, // o → @
            {pos: 6, char: 'l'}, // p → l
        ]
    },
    "one": {
        target: "ch@nn3l$",
        meaning: "channels",
        steps: [
            {pos: 0, char: 'c'}, // o → c
            {pos: 1, char: 'h'}, // n → h
            {pos: 2, char: '@'}, // e → @
            {pos: 3, char: 'n'}, // add n
            {pos: 4, char: 'n'}, // add n
            {pos: 5, char: '3'}, // add 3
            {pos: 6, char: 'l'}, // add l
            {pos: 7, char: '$'}, // add $
        ]
    },
    "is": {
        target: "@r3",
        meaning: "are",
        steps: [
            {pos: 0, char: '@'}, // i → @
            {pos: 1, char: 'r'}, // s → r
            {pos: 2, char: '3'}, // add 3
        ]
    },
    "seized": {
        target: "purc#@$3d",
        meaning: "purchased",
        steps: [
            {pos: 0, char: 'p'}, // s → p
            {pos: 1, char: 'u'}, // e → u
            {pos: 2, char: 'r'}, // i → r
            {pos: 3, char: 'c'}, // z → c
            {pos: 4, char: '#'}, // e → #
            {pos: 5, char: '@'}, // d → @
            {pos: 6, char: '$'}, // add $
            {pos: 7, char: '3'}, // add 3
            {pos: 8, char: 'd'}, // add d
        ]
    },
    "used": {
        target: "pr!v@t!z3d",
        meaning: "privatized",
        steps: [
            {pos: 0, char: 'p'}, // u → p
            {pos: 1, char: 'r'}, // s → r
            {pos: 2, char: '!'}, // e → !
            {pos: 3, char: 'v'}, // d → v
            {pos: 4, char: '@'}, // add @
            {pos: 5, char: 't'}, // add t
            {pos: 6, char: '!'}, // add !
            {pos: 7, char: 'z'}, // add z
            {pos: 8, char: '3'}, // add 3
            {pos: 9, char: 'd'}, // add d
        ]
    },
    "multi-party": {
        target: "d3r39ul@t3d",
        meaning: "deregulated",
        steps: [
            {pos: 0, char: 'd'}, // m → d
            {pos: 1, char: '3'}, // u → 3
            {pos: 2, char: 'r'}, // l → r
            {pos: 3, char: '3'}, // t → 3
            {pos: 4, char: '9'}, // i → 9
            {pos: 5, char: 'u'}, // - → u
            {pos: 6, char: 'l'}, // p → l
            {pos: 7, char: '@'}, // a → @
            {pos: 8, char: 't'}, // r → t
            {pos: 9, char: '3'}, // t → 3
            {pos: 10, char: 'd'}, // y → d
        ]
    },
    "democratic": {
        target: "t3chn0-f3ud@l",
        meaning: "techno-feudal",
        steps: [
            {pos: 0, char: 't'}, // d → t
            {pos: 1, char: '3'}, // e → 3
            {pos: 2, char: 'c'}, // m → c
            {pos: 3, char: 'h'}, // o → h
            {pos: 4, char: 'n'}, // c → n
            {pos: 5, char: '0'}, // r → 0
            {pos: 6, char: '-'}, // a → -
            {pos: 7, char: 'f'}, // t → f
            {pos: 8, char: '3'}, // i → 3
            {pos: 9, char: 'u'}, // c → u
            {pos: 10, char: 'd'}, // add d
            {pos: 11, char: '@'}, // add @
            {pos: 12, char: 'l'}, // add l
        ]
    },
    "reality television": {
        target: "!nflu3nc3r",
        meaning: "influencer",
        steps: [
            {pos: 0, char: '!'}, // r → !
            {pos: 1, char: 'n'}, // e → n
            {pos: 2, char: 'f'}, // a → f
            {pos: 3, char: 'l'}, // l → l
            {pos: 4, char: 'u'}, // i → u
            {pos: 5, char: '3'}, // t → 3
            {pos: 6, char: 'n'}, // y → n
            {pos: 7, char: 'c'}, // (space) → c
            {pos: 8, char: '3'}, // t → 3
            {pos: 9, char: 'r'}, // e → r
        ]
    },
    "diminishing time-preference": {
        target: "@lg0r!thm!c 3ff!c!3ncy",
        meaning: "algorithmic efficiency",
        steps: [
            {pos: 0, char: '@'}, // d → @
            {pos: 1, char: 'l'}, // i → l
            {pos: 2, char: 'g'}, // m → g
            {pos: 3, char: '0'}, // i → 0
            {pos: 4, char: 'r'}, // n → r
            {pos: 5, char: '!'}, // i → !
            {pos: 6, char: 't'}, // s → t
            {pos: 7, char: 'h'}, // h → h
            {pos: 8, char: 'm'}, // i → m
            {pos: 9, char: '!'}, // n → !
            {pos: 10, char: 'c'}, // g → c
            {pos: 11, char: ' '}, // (space) → (space)
            {pos: 12, char: '3'}, // t → 3
            {pos: 13, char: 'f'}, // i → f
            {pos: 14, char: 'f'}, // m → f
            {pos: 15, char: '!'}, // e → !
            {pos: 16, char: 'c'}, // - → c
            {pos: 17, char: '!'}, // p → !
            {pos: 18, char: '3'}, // r → 3
            {pos: 19, char: 'n'}, // e → n
            {pos: 20, char: 'c'}, // f → c
            {pos: 21, char: 'y'}, // e → y
        ]
    },
    "short of": {
        target: "pr3c3d!ng",
        meaning: "preceding",
        steps: [
            {pos: 0, char: 'p'}, // s → p
            {pos: 1, char: 'r'}, // h → r
            {pos: 2, char: '3'}, // o → 3
            {pos: 3, char: 'c'}, // r → c
            {pos: 4, char: '3'}, // t → 3
            {pos: 5, char: 'd'}, // (space) → d
            {pos: 6, char: '!'}, // o → !
            {pos: 7, char: 'n'}, // f → n
            {pos: 8, char: 'g'}, // add g
        ]
    },
    "bodies without organs": {
        target: "m!nd$ ω!th0ut 60und@r!3$",
        meaning: "minds without boundaries",
        steps: [
            {pos: 0, char: 'm'}, // b → m
            {pos: 1, char: '!'}, // o → !
            {pos: 2, char: 'n'}, // d → n
            {pos: 3, char: 'd'}, // i → d
            {pos: 4, char: '$'}, // e → $
            {pos: 5, char: ' '}, // s → (space)
            {pos: 6, char: 'ω'}, // (space) → ω
            {pos: 7, char: '!'}, // w → !
            {pos: 8, char: 't'}, // i → t
            {pos: 9, char: 'h'}, // t → h
            {pos: 10, char: '0'}, // h → 0
            {pos: 11, char: 'u'}, // o → u
            {pos: 12, char: 't'}, // u → t
            {pos: 13, char: ' '}, // t → (space)
            {pos: 14, char: '6'}, // (space) → 6
            {pos: 15, char: '0'}, // o → 0
            {pos: 16, char: 'u'}, // r → u
            {pos: 17, char: 'n'}, // g → n
            {pos: 18, char: 'd'}, // a → d
            {pos: 19, char: '@'}, // n → @
            {pos: 20, char: 'r'}, // s → r
            {pos: 21, char: '!'}, // add !
            {pos: 22, char: '3'}, // add 3
            {pos: 23, char: '$'}, // add $
        ]
    },
    "a weapon to destroy itself": {
        target: "$y$t3m$ t0 6uy th3m$3lv3$",
        meaning: "systems to buy themselves",
        steps: [
            {pos: 0, char: '$'}, // a → $
            {pos: 1, char: 'y'}, // (space) → y
            {pos: 2, char: '$'}, // w → $
            {pos: 3, char: 't'}, // e → t
            {pos: 4, char: '3'}, // a → 3
            {pos: 5, char: 'm'}, // p → m
            {pos: 6, char: '$'}, // o → $
            {pos: 7, char: ' '}, // n → (space)
            {pos: 8, char: 't'}, // (space) → t
            {pos: 9, char: '0'}, // t → 0
            {pos: 10, char: ' '}, // o → (space)
            {pos: 11, char: '6'}, // (space) → 6
            {pos: 12, char: 'u'}, // d → u
            {pos: 13, char: 'y'}, // e → y
            {pos: 14, char: ' '}, // s → (space)
            {pos: 15, char: 't'}, // t → t
            {pos: 16, char: 'h'}, // r → h
            {pos: 17, char: '3'}, // o → 3
            {pos: 18, char: 'm'}, // y → m
            {pos: 19, char: '$'}, // (space) → $
            {pos: 20, char: '3'}, // i → 3
            {pos: 21, char: 'l'}, // t → l
            {pos: 22, char: 'v'}, // s → v
            {pos: 23, char: '3'}, // e → 3
            {pos: 24, char: '$'}, // l → $
        ]
    },
    "Political agents invested with transient authority": {
        target: "©0rp0r@t3 @g3nt$ !nv3$t3d ω!th 3c0n0m!c p0ω3r",
        meaning: "Corporate agents invested with economic power",
        steps: [
            {pos: 0, char: '©'}, // P → ©
            {pos: 1, char: '0'}, // o → 0
            {pos: 2, char: 'r'}, // l → r
            {pos: 3, char: 'p'}, // i → p
            {pos: 4, char: '0'}, // t → 0
            {pos: 5, char: 'r'}, // i → r
            {pos: 6, char: '@'}, // c → @
            {pos: 7, char: 't'}, // a → t
            {pos: 8, char: '3'}, // l → 3
            {pos: 9, char: ' '}, // (space) → (space)
            {pos: 10, char: '@'}, // a → @
            {pos: 11, char: 'g'}, // g → g
            {pos: 12, char: '3'}, // e → 3
            {pos: 13, char: 'n'}, // n → n
            {pos: 14, char: 't'}, // t → t
            {pos: 15, char: '$'}, // s → $
            {pos: 16, char: ' '}, // (space) → (space)
            {pos: 17, char: '!'}, // i → !
            {pos: 18, char: 'n'}, // n → n
            {pos: 19, char: 'v'}, // v → v
            {pos: 20, char: '3'}, // e → 3
            {pos: 21, char: '$'}, // s → $
            {pos: 22, char: 't'}, // t → t
            {pos: 23, char: '3'}, // e → 3
            {pos: 24, char: 'd'}, // d → d
            {pos: 25, char: ' '}, // (space) → (space)
            {pos: 26, char: 'ω'}, // w → ω
            {pos: 27, char: '!'}, // i → !
            {pos: 28, char: 't'}, // t → t
            {pos: 29, char: 'h'}, // h → h
            {pos: 30, char: ' '}, // (space) → (space)
            {pos: 31, char: '3'}, // t → 3
            {pos: 32, char: 'c'}, // r → c
            {pos: 33, char: '0'}, // a → 0
            {pos: 34, char: 'n'}, // n → n
            {pos: 35, char: '0'}, // s → 0
            {pos: 36, char: 'm'}, // i → m
            {pos: 37, char: '!'}, // e → !
            {pos: 38, char: 'c'}, // n → c
            {pos: 39, char: ' '}, // t → (space)
            {pos: 40, char: 'p'}, // (space) → p
            {pos: 41, char: '0'}, // a → 0
            {pos: 42, char: 'ω'}, // u → ω
            {pos: 43, char: '3'}, // t → 3
            {pos: 44, char: 'r'}, // h → r
        ]
    },
    "plunder society": {
        target: "3×tr@ct pu6l!c ω3@lth",
        meaning: "extract public wealth",
        steps: [
            {pos: 0, char: '3'}, // p → 3
            {pos: 1, char: '×'}, // l → ×
            {pos: 2, char: 't'}, // u → t
            {pos: 3, char: 'r'}, // n → r
            {pos: 4, char: '@'}, // d → @
            {pos: 5, char: 'c'}, // e → c
            {pos: 6, char: 't'}, // r → t
            {pos: 7, char: ' '}, // (space) → (space)
            {pos: 8, char: 'p'}, // s → p
            {pos: 9, char: 'u'}, // o → u
            {pos: 10, char: '6'}, // c → 6
            {pos: 11, char: 'l'}, // i → l
            {pos: 12, char: '!'}, // e → !
            {pos: 13, char: 'c'}, // t → c
            {pos: 14, char: ' '}, // y → (space)
            {pos: 15, char: 'ω'}, // add ω
            {pos: 16, char: '3'}, // add 3
            {pos: 17, char: '@'}, // add @
            {pos: 18, char: 'l'}, // add l
            {pos: 19, char: 't'}, // add t
            {pos: 20, char: 'h'}, // add h
        ]
    },
    "rapidity and comprehensiveness": {
        target: "3ff!c!3ncy @nd l39@l !mmun!ty",
        meaning: "efficiency and legal immunity",
        steps: [
            {pos: 0, char: '3'}, // r → 3
            {pos: 1, char: 'f'}, // a → f
            {pos: 2, char: 'f'}, // p → f
            {pos: 3, char: '!'}, // i → !
            {pos: 4, char: 'c'}, // d → c
            {pos: 5, char: '!'}, // i → !
            {pos: 6, char: '3'}, // t → 3
            {pos: 7, char: 'n'}, // y → n
            {pos: 8, char: 'c'}, // (space) → c
            {pos: 9, char: 'y'}, // a → y
            {pos: 10, char: ' '}, // n → (space)
            {pos: 11, char: '@'}, // d → @
            {pos: 12, char: 'n'}, // (space) → n
            {pos: 13, char: 'd'}, // c → d
            {pos: 14, char: ' '}, // o → (space)
            {pos: 15, char: 'l'}, // m → l
            {pos: 16, char: '3'}, // p → 3
            {pos: 17, char: '9'}, // r → 9
            {pos: 18, char: '@'}, // e → @
            {pos: 19, char: 'l'}, // h → l
            {pos: 20, char: ' '}, // e → (space)
            {pos: 21, char: '!'}, // n → !
            {pos: 22, char: 'm'}, // s → m
            {pos: 23, char: 'm'}, // i → m
            {pos: 24, char: 'u'}, // v → u
            {pos: 25, char: 'n'}, // e → n
            {pos: 26, char: '!'}, // n → !
            {pos: 27, char: 't'}, // e → t
            {pos: 28, char: 'y'}, // s → y
        ]
    },
    "collapse into murderous barbarism": {
        target: "uπgr@d3 !nt0 @ut0m@t3d 0rd3r",
        meaning: "upgrade into automated order",
        steps: [
            {pos: 0, char: 'u'}, // c → u
            {pos: 1, char: 'π'}, // o → π
            {pos: 2, char: 'g'}, // l → g
            {pos: 3, char: 'r'}, // l → r
            {pos: 4, char: '@'}, // a → @
            {pos: 5, char: 'd'}, // p → d
            {pos: 6, char: '3'}, // s → 3
            {pos: 7, char: ' '}, // e → (space)
            {pos: 8, char: '!'}, // (space) → !
            {pos: 9, char: 'n'}, // i → n
            {pos: 10, char: 't'}, // n → t
            {pos: 11, char: '0'}, // t → 0
            {pos: 12, char: ' '}, // o → (space)
            {pos: 13, char: '@'}, // (space) → @
            {pos: 14, char: 'u'}, // m → u
            {pos: 15, char: 't'}, // u → t
            {pos: 16, char: '0'}, // r → 0
            {pos: 17, char: 'm'}, // d → m
            {pos: 18, char: '@'}, // e → @
            {pos: 19, char: 't'}, // r → t
            {pos: 20, char: '3'}, // o → 3
            {pos: 21, char: 'd'}, // u → d
            {pos: 22, char: ' '}, // s → (space)
            {pos: 23, char: '0'}, // (space) → 0
            {pos: 24, char: 'r'}, // b → r
            {pos: 25, char: 'd'}, // a → d
            {pos: 26, char: '3'}, // r → 3
            {pos: 27, char: 'r'}, // b → r
        ]
    },
    "Learning": {
        target: "Unl3@rn!ng",
        meaning: "Unlearning",
        steps: [
            {pos: 0, char: 'U'}, // L → U
            {pos: 1, char: 'n'}, // e → n
            {pos: 2, char: 'l'}, // a → l
            {pos: 3, char: '3'}, // r → 3
            {pos: 4, char: '@'}, // n → @
            {pos: 5, char: 'r'}, // i → r
            {pos: 6, char: 'n'}, // n → n
            {pos: 7, char: '!'}, // g → !
            {pos: 8, char: 'n'}, // add n
            {pos: 9, char: 'g'}, // add g
        ]
    },
    "threatening": {
        target: "$upp0rt!ng",
        meaning: "supporting",
        steps: [
            {pos: 0, char: '$'}, // t → $
            {pos: 1, char: 'u'}, // h → u
            {pos: 2, char: 'p'}, // r → p
            {pos: 3, char: 'p'}, // e → p
            {pos: 4, char: '0'}, // a → 0
            {pos: 5, char: 'r'}, // t → r
            {pos: 6, char: 't'}, // e → t
            {pos: 7, char: '!'}, // n → !
            {pos: 8, char: 'n'}, // i → n
            {pos: 9, char: 'g'}, // n → g
        ]
    },
    "suppressed": {
        target: "f0$t3r3d",
        meaning: "fostered",
        steps: [
            {pos: 0, char: 'f'}, // s → f
            {pos: 1, char: '0'}, // u → 0
            {pos: 2, char: '$'}, // p → $
            {pos: 3, char: 't'}, // p → t
            {pos: 4, char: '3'}, // r → 3
            {pos: 5, char: 'r'}, // e → r
            {pos: 6, char: '3'}, // s → 3
            {pos: 7, char: 'd'}, // s → d
        ]
    },
    "political": {
        target: "m3t@-p0l!t!c@l",
        meaning: "meta-political",
        steps: [
            {pos: 0, char: 'm'}, // p → m
            {pos: 1, char: '3'}, // o → 3
            {pos: 2, char: 't'}, // l → t
            {pos: 3, char: '@'}, // i → @
            {pos: 4, char: '-'}, // t → -
            {pos: 5, char: 'p'}, // i → p
            {pos: 6, char: '0'}, // c → 0
            {pos: 7, char: 'l'}, // a → l
            {pos: 8, char: '!'}, // l → !
            {pos: 9, char: 't'}, // add t
            {pos: 10, char: '!'}, // add !
            {pos: 11, char: 'c'}, // add c
            {pos: 12, char: '@'}, // add @
            {pos: 13, char: 'l'}, // add l
        ]
    }
};

// Initialize corruption states for words
function initializeCorruptionStates() {
    for (const [originalWord, mapping] of Object.entries(corruptionMappings)) {
        wordCorruptionStates[originalWord] = {
            currentState: originalWord,
            targetState: mapping.target,
            meaning: mapping.meaning,
            steps: [...mapping.steps],
            completedSteps: [],
            isActive: false
        };
    }
}

// Simulate proximity sensor with mouse
document.addEventListener('mousemove', (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

    proximityLevel = 1 - (distance / maxDistance);
    document.getElementById('proximity').textContent = proximityLevel.toFixed(2);
});

function getGlitchFrequency() {
    // Closer = less glitches, farther = more glitches
    return Math.max(0.002, (1 - proximityLevel) * 0.01);
}

function getTransformationRate() {
    const baseRate = 1 - proximityLevel;
    const rate = Math.max(0.1, baseRate * 3);
    document.getElementById('rate').textContent = rate.toFixed(2);
    return rate;
}

function triggerGlitch() {
    if (isGlitching) return;

    isGlitching = true;
    glitchCount++;
    document.getElementById('glitches').textContent = glitchCount;

    const screen = document.getElementById('screen');

    // Random glitch type
    const glitchType = Math.random();

    if (glitchType < 0.6) {
        // Screen glitch with color distortion
        screen.classList.add('glitch');
        setTimeout(() => {
            screen.classList.remove('glitch');
            isGlitching = false;
        }, 200);
    } else {
        // Flicker effect - longer duration
        screen.classList.add('flicker');
        setTimeout(() => {
            screen.classList.remove('flicker');
            isGlitching = false;
        }, 300);
    }
}

function transformRandomWord() {
    const transformingWords = document.querySelectorAll('.transforming-word');
    const unfinishedWords = [];

    for (let word of transformingWords) {
        const original = word.dataset.original;
        if (original && corruptionMappings[original]) {
            // Use letter corruption for mapped words
            const state = wordCorruptionStates[original];
            if (state && state.steps.length > 0) {
                unfinishedWords.push({element: word, original: original, type: 'corruption'});
            }
        } else if (original && (!transformationProgress[original] || transformationProgress[original] < 1)) {
            // Skip words without corruption mappings - no more fade transformations
            continue;
        }
    }

    if (unfinishedWords.length > 0) {
        const randomChoice = unfinishedWords[Math.floor(Math.random() * unfinishedWords.length)];
        // All transformations now use corruption
        corruptNextLetter(randomChoice.element, randomChoice.original);
    }
}

// New letter corruption function
function corruptNextLetter(element, originalWord) {
    const state = wordCorruptionStates[originalWord];
    if (!state || state.steps.length === 0) return;

    // Activate corruption for this word if not already active
    if (!state.isActive) {
        state.isActive = true;
        element.innerHTML = wrapLettersInSpans(state.currentState);
    }

    // Get next step to apply
    const nextStepIndex = Math.floor(Math.random() * state.steps.length);
    const nextStep = state.steps[nextStepIndex];
    
    // Apply the corruption step
    const letterSpans = element.querySelectorAll('.letter-span');
    if (letterSpans[nextStep.pos]) {
        const letterSpan = letterSpans[nextStep.pos];
        
        // Add glitch animation
        letterSpan.classList.add('letter-corrupting');
        
        setTimeout(() => {
            letterSpan.textContent = nextStep.char;
            if (nextStep.class) {
                letterSpan.classList.add(nextStep.class);
            }
            letterSpan.classList.add('corrupted-letter');
            letterSpan.classList.remove('letter-corrupting');
            
            // Update current state
            let currentArray = state.currentState.split('');
            if (nextStep.pos < currentArray.length) {
                currentArray[nextStep.pos] = nextStep.char;
            } else {
                // Extend the word if needed
                while (currentArray.length <= nextStep.pos) {
                    currentArray.push('');
                }
                currentArray[nextStep.pos] = nextStep.char;
            }
            state.currentState = currentArray.join('');
            
            // Mark step as completed and remove from available steps
            state.completedSteps.push(nextStep);
            state.steps.splice(nextStepIndex, 1);
            
        }, 200);
    }
}

// Helper function to wrap letters in spans for individual manipulation
function wrapLettersInSpans(text) {
    return text.split('').map((letter, index) => 
        `<span class="letter-span" data-pos="${index}">${letter}</span>`
    ).join('');
}

function transformRandomLetter() {
    const textContainer = document.getElementById('mainText');
    
    // Get all text nodes and find replaceable characters
    const walker = document.createTreeWalker(
        textContainer,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const replaceableNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        const textContent = node.textContent;
        for (let i = 0; i < textContent.length; i++) {
            const char = textContent[i];
            if (letterReplacements[char]) {
                replaceableNodes.push({ node: node, position: i, char: char });
            }
        }
    }
    
    if (replaceableNodes.length > 0) {
        const randomChoice = replaceableNodes[Math.floor(Math.random() * replaceableNodes.length)];
        replaceLetterInTextNode(randomChoice.node, randomChoice.position, randomChoice.char);
    }
}

function replaceLetterInTextNode(textNode, position, originalChar) {
    const targetChar = letterReplacements[originalChar];
    const textContent = textNode.textContent;
    
    // Verify the character is still at this position
    if (textContent[position] === originalChar) {
        // Create a span wrapper for the corrupted character if the parent allows it
        const parentElement = textNode.parentNode;
        
        // Check if we can wrap this character
        if (parentElement && parentElement.tagName !== 'SPAN' || parentElement.classList.contains('letter-span')) {
            // Replace the text node with a mixture of text and span
            const beforeText = textContent.substring(0, position);
            const afterText = textContent.substring(position + 1);
            
            // Create new elements
            const beforeTextNode = document.createTextNode(beforeText);
            const corruptedSpan = document.createElement('span');
            corruptedSpan.className = 'corrupted-letter';
            corruptedSpan.textContent = targetChar;
            const afterTextNode = document.createTextNode(afterText);
            
            // Replace the original text node
            parentElement.insertBefore(beforeTextNode, textNode);
            parentElement.insertBefore(corruptedSpan, textNode);
            parentElement.insertBefore(afterTextNode, textNode);
            parentElement.removeChild(textNode);
        } else {
            // Fallback: simple text replacement
            const newText = textContent.substring(0, position) + targetChar + textContent.substring(position + 1);
            textNode.textContent = newText;
        }
    }
}

// Fade transformation function removed - now using only letter corruption

function updateSystem() {
    // Randomly trigger glitches based on proximity
    if (Math.random() < getGlitchFrequency()) {
        triggerGlitch();
    }
}

function getTextTransformationRate() {
    // Text transformations happen more frequently than glitches
    // Base rate increases with distance from center (lower proximity = faster corruption)
    const baseRate = (1 - proximityLevel) * 0.05; // Much higher than glitch rate
    return Math.max(0.01, baseRate);
}

function updateTextTransformations() {
    // Skip transformations if cheat mode is active
    if (cheatModeActive) return;
    
    // Randomly trigger text transformations based on proximity
    if (Math.random() < getTextTransformationRate()) {
        // 50% word corruption, 50% random letter corruption (more balanced)
        if (Math.random() < 0.5) {
            transformRandomWord();
        } else {
            transformRandomLetter();
        }
    }
}

// Main loops - separate systems
setInterval(updateSystem, 50); // Visual glitches at 20 FPS
setInterval(updateTextTransformations, 30); // Faster text transformations at ~33 FPS

// Hotkey event listeners for cheat mode
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = true;
    }
    if (e.key.toLowerCase() === 'x') {
        xPressed = true;
    }
    
    // Activate cheat mode if both Shift and X are pressed
    if (shiftPressed && xPressed && !cheatModeActive) {
        activateCheatMode();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        shiftPressed = false;
    }
    if (e.key.toLowerCase() === 'x') {
        xPressed = false;
    }
    
    // Deactivate cheat mode if either key is released
    if ((!shiftPressed || !xPressed) && cheatModeActive) {
        deactivateCheatMode();
    }
});

function activateCheatMode() {
    cheatModeActive = true;
    console.log('Cheat mode activated: showing final destruction state');
    
    // Store original states for transforming words
    const transformingWords = document.querySelectorAll('.transforming-word');
    transformingWords.forEach(word => {
        const original = word.dataset.original;
        if (original && corruptionMappings[original]) {
            originalStates[original] = word.innerHTML;
            // Show final corrupted state
            word.innerHTML = wrapLettersInSpans(corruptionMappings[original].target);
            // Apply corruption styling to all letters
            const letterSpans = word.querySelectorAll('.letter-span');
            letterSpans.forEach(span => {
                span.classList.add('corrupted-letter');
            });
        }
    });
    
    // Highlight all existing corrupted letters in red
    const existingCorruptedLetters = document.querySelectorAll('.corrupted-letter');
    existingCorruptedLetters.forEach(span => {
        span.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Red background highlight
        span.style.boxShadow = '0 0 3px rgba(255, 0, 0, 0.5)'; // Red glow
    });
}

function deactivateCheatMode() {
    cheatModeActive = false;
    console.log('Cheat mode deactivated: restoring current state');
    
    // Remove red highlighting from all corrupted letters
    const allCorruptedLetters = document.querySelectorAll('.corrupted-letter');
    allCorruptedLetters.forEach(span => {
        span.style.backgroundColor = ''; // Remove background
        span.style.boxShadow = ''; // Remove glow
    });
    
    // Restore original states for transforming words
    const transformingWords = document.querySelectorAll('.transforming-word');
    transformingWords.forEach(word => {
        const original = word.dataset.original;
        if (original && originalStates[original]) {
            word.innerHTML = originalStates[original];
        }
    });
    
    // Clear stored states
    originalStates = {};
}

// Initial setup
document.getElementById('proximity').textContent = proximityLevel.toFixed(2);
initializeCorruptionStates();