"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KIRO_MINI = exports.KIRO_PIXEL = exports.KIRO_DETAILED = exports.KIRO_ASCII = void 0;
// ASCII art representation of Kiro character
exports.KIRO_ASCII = {
    normal: '◆',
    active: '◇',
    error: '◈',
    complete: '◊'
};
// More detailed ASCII art (if space allows)
exports.KIRO_DETAILED = {
    normal: '▣',
    active: '▢',
    error: '▤',
    complete: '▥'
};
// Pixel art style using Unicode block elements
exports.KIRO_PIXEL = {
    normal: '█▀█',
    active: '█▄█',
    error: '▀▄▀',
    complete: '▄▀▄'
};
// Small pixel representation
exports.KIRO_MINI = {
    normal: '▪',
    active: '▫',
    error: '◾',
    complete: '◽'
};
//# sourceMappingURL=kiro-ascii.js.map