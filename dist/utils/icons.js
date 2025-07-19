"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class IconManager {
    constructor(context) {
        this.context = context;
    }
    // Get the path to the Kiro icon
    getKiroIconPath() {
        return vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'kiro.svg'));
    }
    // Create a status bar item with the Kiro icon
    createStatusBarItemWithIcon() {
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        // Try to use the custom icon, fallback to text if not available
        try {
            const iconPath = this.getKiroIconPath();
            // VS Code doesn't support custom icons in status bar directly
            // So we'll use a Unicode character that looks similar
            statusBarItem.text = '$(ghost)'; // VS Code built-in ghost icon
        }
        catch (error) {
            // Fallback to simple text
            statusBarItem.text = '👻';
        }
        return statusBarItem;
    }
    // Get different animation states
    getAnimationStates() {
        // Using VS Code's built-in icons for animation
        return [
            '$(ghost)', // Ghost icon
            '$(star-full)', // Star icon  
            '$(sparkle)', // Sparkle icon (if available)
            '$(circle-filled)' // Circle icon
        ];
    }
    // Get state-specific icons
    getStateIcon(state) {
        switch (state) {
            case 'idle':
                return '$(ghost)';
            case 'active':
                return '$(zap)';
            case 'error':
                return '$(warning)';
            case 'success':
                return '$(check)';
            case 'completion':
                return '$(trophy)';
            case 'notification':
                return '$(bell)';
            case 'celebration':
                return '$(star-full)';
            default:
                return '$(ghost)';
        }
    }
}
exports.IconManager = IconManager;
//# sourceMappingURL=icons.js.map