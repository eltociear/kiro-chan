// Create pixel art representation of Kiro character using Unicode
// Based on the SVG paths we extracted

export class KiroPixelArt {
    // Different states of Kiro using Unicode block characters
    static readonly NORMAL = '⬜🟣⬜';  // Simple 3-pixel representation
    static readonly ACTIVE = '🟣⚡🟣';  // Active with lightning
    static readonly ERROR = '❌🟣❌';   // Error state
    static readonly COMPLETE = '✨🟣✨'; // Complete with sparkles
    
    // More detailed representations
    static readonly DETAILED = {
        NORMAL: '🟣👁🟣',      // Purple with eyes
        WINK: '🟣😉🟣',       // Winking
        HAPPY: '🟣😊🟣',      // Happy
        SLEEPY: '🟣😴🟣'      // Sleepy
    };
    
    // Animated frames for smooth transitions
    static readonly FRAMES = [
        '⬜🟣⬜',
        '▫️🟣▫️',
        '⬛🟣⬛',
        '▫️🟣▫️'
    ];
    
    // Get character for specific state
    static getCharacter(state: string, animated: boolean = false, frame: number = 0): string {
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
    static getASCII(state: string): string {
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
    static getSVGLike(state: string = 'normal'): string {
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