"use strict";
// Kiro character representations using Unicode characters
// These create a pixel-art style appearance similar to the SVG
Object.defineProperty(exports, "__esModule", { value: true });
exports.KIRO_CHARS = void 0;
exports.getKiroCharacter = getKiroCharacter;
exports.KIRO_CHARS = {
    // Using box drawing characters to create a pixel art style
    normal: '⬜', // White square for the character
    purple: '🟪', // Purple square (closest to the SVG color)
    // More detailed representations using multiple characters
    detailed: {
        normal: '▓▒░', // Gradient effect
        active: '░▒▓', // Reverse gradient
        error: '▓▓▓', // Solid blocks
        complete: '░░░' // Light blocks
    },
    // Pixel art style faces
    faces: {
        normal: '◉◉', // Eyes
        happy: '◠◡', // Happy eyes
        active: '◉▪', // Winking
        error: '✖✖', // X eyes
        complete: '★★' // Star eyes
    },
    // Using combining characters for overlay effects
    combined: {
        normal: '█\u0336', // Block with strikethrough
        active: '█\u033f', // Block with double overline
        error: '█\u0338', // Block with diagonal stroke
        complete: '█\u20d2' // Block with vertical line overlay
    },
    // Minimalist approach
    minimal: {
        normal: '●', // Filled circle
        active: '○', // Empty circle
        error: '⊗', // Circled times
        complete: '◉' // Bullseye
    }
};
// Function to get the best character based on VS Code theme
function getKiroCharacter(state = 'normal') {
    // For now, use the purple square as it's closest to the SVG
    switch (state) {
        case 'idle':
            return exports.KIRO_CHARS.purple;
        case 'active':
            return exports.KIRO_CHARS.faces.active;
        case 'error':
            return exports.KIRO_CHARS.faces.error;
        case 'complete':
            return exports.KIRO_CHARS.faces.complete;
        default:
            return exports.KIRO_CHARS.purple;
    }
}
//# sourceMappingURL=kiro-characters.js.map