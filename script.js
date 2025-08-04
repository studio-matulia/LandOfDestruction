let transformationProgress = {};
let proximityLevel = 0.5;
let glitchCount = 0;
let isGlitching = false;

// Letter replacement mappings
const letterReplacements = {
    'o': '0', 'O': '0',
    'e': '3', 'E': '3',
    'a': '@', 'A': '@',
    'i': '!', 'I': '1',
    's': '$', 'S': '$',
    't': '7', 'T': '7'
};

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

    // Transform text during glitch
    if (Math.random() < 0.7) {
        transformRandomWord();
    } else {
        transformRandomLetter();
    }
}

function transformRandomWord() {
    const transformingWords = document.querySelectorAll('.transforming-word');
    const unfinishedWords = [];

    for (let word of transformingWords) {
        const id = word.dataset.original;
        if (id && (!transformationProgress[id] || transformationProgress[id] < 1)) {
            unfinishedWords.push(word);
        }
    }

    if (unfinishedWords.length > 0) {
        const randomWord = unfinishedWords[Math.floor(Math.random() * unfinishedWords.length)];
        startWordFadeTransformation(randomWord);
    }
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
        const newText = textContent.substring(0, position) + targetChar + textContent.substring(position + 1);
        
        // Fade effect on the main container
        const textContainer = document.getElementById('mainText');
        textContainer.style.opacity = '0.5';
        
        setTimeout(() => {
            textNode.textContent = newText;
            textContainer.style.opacity = '1';
        }, 100);
    }
}

function startWordFadeTransformation(element) {
    const original = element.dataset.original;
    const target = element.dataset.target;

    // Fade out original text
    element.classList.add('word-fade-out');

    setTimeout(() => {
        // Replace text while partially faded (overlapping effect)
        element.textContent = target;
        element.classList.remove('word-fade-out');
        element.classList.add('word-fade-in');

        // Mark as transformed
        transformationProgress[original] = 1;

        setTimeout(() => {
            element.classList.remove('word-fade-in');
        }, 8000);
    }, 4000); // Start fade-in before fade-out is complete (overlap)
}

function updateSystem() {
    // Randomly trigger glitches based on proximity
    if (Math.random() < getGlitchFrequency()) {
        triggerGlitch();
    }
}

// Main loop
setInterval(updateSystem, 50);

// Initial setup
document.getElementById('proximity').textContent = proximityLevel.toFixed(2);