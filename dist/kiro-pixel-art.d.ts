export declare class KiroPixelArt {
    static readonly NORMAL = "\u2B1C\uD83D\uDFE3\u2B1C";
    static readonly ACTIVE = "\uD83D\uDFE3\u26A1\uD83D\uDFE3";
    static readonly ERROR = "\u274C\uD83D\uDFE3\u274C";
    static readonly COMPLETE = "\u2728\uD83D\uDFE3\u2728";
    static readonly DETAILED: {
        NORMAL: string;
        WINK: string;
        HAPPY: string;
        SLEEPY: string;
    };
    static readonly FRAMES: string[];
    static getCharacter(state: string, animated?: boolean, frame?: number): string;
    static getASCII(state: string): string;
    static getSVGLike(state?: string): string;
}
//# sourceMappingURL=kiro-pixel-art.d.ts.map