"use strict";
// Create pixel art representation of Kiro character using Unicode
// Based on the SVG paths we extracted
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiroPixelArt = void 0;
class KiroPixelArt {
    // Get character for specific state
    static getCharacter(state, animated = false, frame = 0) {
        if (animated) {
            return this.FRAMES[frame % this.FRAMES.length];
        }
        switch (state.toLowerCase()) {
            case 'idle':
            case 'normal':
                return this.NORMAL;
            case 'active':
                return this.ACTIVE;
            case 'error':
                return this.ERROR;
            case 'complete':
            case 'completed':
                return this.COMPLETE;
            case 'wink':
                return this.DETAILED.WINK;
            case 'happy':
                return this.DETAILED.HAPPY;
            case 'sleepy':
                return this.DETAILED.SLEEPY;
            default:
                return this.NORMAL;
        }
    }
    // Create ASCII art version for terminals that don't support emojis
    static getASCII(state) {
        switch (state.toLowerCase()) {
            case 'idle':
            case 'normal':
                return '[o_o]';
            case 'active':
                return '[^_^]';
            case 'error':
                return '[x_x]';
            case 'complete':
                return '[*_*]';
            default:
                return '[o_o]';
        }
    }
    // Get a combination that looks most like the SVG
    static getSVGLike(state = 'normal') {
        // The SVG has purple body with black eyes and white highlights
        // Try to approximate this with Unicode
        switch (state.toLowerCase()) {
            case 'idle':
            case 'normal':
                return '👾'; // Space invader (closest to pixel art)
            case 'active':
                return '🤖'; // Robot face
            case 'error':
                return '💀'; // Skull
            case 'complete':
                return '🎉'; // Party
            default:
                return '👾';
        }
    }
}
exports.KiroPixelArt = KiroPixelArt;
// Different states of Kiro using Unicode block characters
KiroPixelArt.NORMAL = '⬜🟣⬜'; // Simple 3-pixel representation
KiroPixelArt.ACTIVE = '🟣⚡🟣'; // Active with lightning
KiroPixelArt.ERROR = '❌🟣❌'; // Error state
KiroPixelArt.COMPLETE = '✨🟣✨'; // Complete with sparkles
// More detailed representations
KiroPixelArt.DETAILED = {
    NORMAL: '🟣👁🟣', // Purple with eyes
    WINK: '🟣😉🟣', // Winking
    HAPPY: '🟣😊🟣', // Happy
    SLEEPY: '🟣😴🟣' // Sleepy
};
// Animated frames for smooth transitions
KiroPixelArt.FRAMES = [
    '⬜🟣⬜',
    '▫️🟣▫️',
    '⬛🟣⬛',
    '▫️🟣▫️'
];
