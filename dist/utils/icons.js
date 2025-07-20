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
        this.iconPath = path.join(context.extensionPath, 'images', 'kiro.svg');
    }
    // Get the main Kiro icon (no more emojis!)
    getKiroIcon() {
        // VS Code status bar supports $(icon-name) syntax for built-in icons
        // For custom icons, we use the icon path
        return '$(symbol-misc)'; // Fallback to built-in icon
    }
    // Get icon for different states (all use the same Kiro image)
    getStateIcon(state) {
        // Always return the same Kiro icon, no more emojis
        return '$(symbol-misc) Kiro';
    }
    // Get animation states (no more emoji animation)
    getAnimationStates() {
        // Return the same icon for all animation frames
        // This effectively disables emoji animation
        return [
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro',
            '$(symbol-misc) Kiro'
        ];
    }
    // Alternative: Use ThemeIcon for better VS Code integration
    getThemeIcon() {
        return new vscode.ThemeIcon('symbol-misc');
    }
    // Get icon URI for the custom SVG
    getIconUri() {
        return vscode.Uri.file(this.iconPath);
    }
}
exports.IconManager = IconManager;
//# sourceMappingURL=icons.js.map