# Land of Destruction

An interactive digital art piece exploring the descent into authoritarian madness through the lens of Nick Land's accelerationist philosophy.

## Overview

This web-based artwork presents a text that gradually transforms as the viewer's proximity changes. The piece uses mouse movement to simulate a proximity sensor, triggering various visual and textual transformations that reflect the philosophical shift from anti-authoritarianism to authoritarianism.

## Features

- **Proximity-based interaction**: Mouse movement controls the transformation rate
- **Letter replacement**: Individual letters slowly morph into symbols and numbers (e.g., 'o' → '0', 'a' → '@')
- **Word transformation**: Key philosophical terms fade and transform into their opposites
- **Visual glitch effects**: Screen distortions, flickering, and color shifts
- **Real-time feedback**: Debug panel showing proximity, transformation rate, and glitch events

## Technical Implementation

The artwork uses vanilla JavaScript with:
- TreeWalker API for precise text node manipulation
- CSS animations for glitch and fade effects
- Real-time proximity calculations based on mouse position
- Progressive text corruption system

## Usage

Simply open `index.html` in a web browser and move your mouse around the screen. The closer you are to the center, the slower the corruption; the further away, the faster the descent into digital madness.

## Files

- `index.html` - Main HTML structure
- `script.js` - Core interaction logic and text transformation
- `style.css` - Visual styling and effects