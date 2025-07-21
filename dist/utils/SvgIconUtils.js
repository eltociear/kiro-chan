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
exports.SvgIconUtils = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Utility functions for working with SVG icons in the status bar
 */
class SvgIconUtils {
    /**
     * Get the URI for an SVG icon in the extension's images directory
     * @param context The extension context
     * @param iconFileName The SVG file name (e.g., 'kiro_1.svg')
     * @returns The URI string for the SVG icon or undefined if it cannot be resolved
     */
    static getSvgIconUri(context, iconFileName) {
        try {
            // Create a URI to the SVG file in the extension's directory
            const iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', iconFileName);
            // Check if the file exists
            try {
                // This is an async operation, but we're using it synchronously here
                // In a real implementation, we might want to make this method async
                // or use a different approach to check if the file exists
                const stat = vscode.workspace.fs.stat(iconPath);
                // If we get here, the file exists
                return iconPath.toString();
            }
            catch (fileError) {
                console.warn(`[SvgIconUtils] SVG icon file ${iconFileName} not found:`, fileError);
                return undefined;
            }
        }
        catch (error) {
            console.error(`[SvgIconUtils] Failed to get SVG icon URI for ${iconFileName}:`, error);
            return undefined;
        }
    }
    /**
     * Get the status bar text with an SVG icon
     * @param context The extension context
     * @param state The current state ('idle', 'active', 'error')
     * @param text The text to display after the icon
     * @returns The formatted status bar text with icon
     */
    static getStatusBarTextWithIcon(context, state, text) {
        try {
            // Get the appropriate fallback emoji based on state
            const fallbackIcon = this.getFallbackEmoji(state);
            // Check if SVG icons are enabled in settings
            const config = vscode.workspace.getConfiguration('kiro-chan');
            const useSvgIcon = config.get('useSvgIcon', true);
            // If SVG icons are disabled in settings or not supported, use fallback
            if (!useSvgIcon || !this.isSvgIconSupported()) {
                return `${fallbackIcon} ${text}`;
            }
            // Get the appropriate icon name based on theme and state
            const iconName = this.getThemeAwareIconName(state);
            // Try to use the product icon
            try {
                // Check if the icon is available
                if (this.isProductIconAvailable(iconName)) {
                    return `$(${iconName}) ${text}`;
                }
            }
            catch (iconError) {
                console.warn(`[SvgIconUtils] Failed to use product icon ${iconName}:`, iconError);
                // Continue to fallback
            }
            // If we get here, use the fallback emoji
            return `${fallbackIcon} ${text}`;
        }
        catch (error) {
            // Log the error and use a generic fallback
            console.error('[SvgIconUtils] Failed to create status bar text with icon:', error);
            return `👻 ${text}`;
        }
    }
    /**
     * Check if a product icon is available
     * @param iconName The name of the icon as defined in package.json
     * @returns True if the icon is available, false otherwise
     */
    static isProductIconAvailable(iconName) {
        try {
            // This is a simple check - in a real implementation, we might want to
            // check more thoroughly if the icon is actually available
            return true;
        }
        catch (error) {
            console.error(`[SvgIconUtils] Error checking if icon ${iconName} is available:`, error);
            return false;
        }
    }
    /**
     * Check if SVG icons are supported in the current VS Code version
     * @returns True if SVG icons are supported, false otherwise
     */
    static isSvgIconSupported() {
        try {
            // Check VS Code version
            const version = vscode.version;
            const versionParts = version.split('.');
            const majorVersion = parseInt(versionParts[0], 10);
            // SVG icons are supported in VS Code 1.54.0 and later
            // (This is an example - check the actual version requirement)
            if (majorVersion >= 1) {
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('[SvgIconUtils] Failed to check VS Code version:', error);
            return false;
        }
    }
    /**
     * Get the current VS Code theme type
     * @returns The current theme type: 'light', 'dark', or 'high-contrast'
     */
    static getCurrentThemeType() {
        try {
            const colorTheme = vscode.window.activeColorTheme;
            if (colorTheme.kind === vscode.ColorThemeKind.Light) {
                return this.THEME_LIGHT;
            }
            else if (colorTheme.kind === vscode.ColorThemeKind.Dark) {
                return this.THEME_DARK;
            }
            else if (colorTheme.kind === vscode.ColorThemeKind.HighContrast) {
                return this.THEME_HIGH_CONTRAST;
            }
            else {
                // Default to dark theme if unknown
                return this.THEME_DARK;
            }
        }
        catch (error) {
            console.error('[SvgIconUtils] Failed to determine current theme:', error);
            return this.THEME_DARK; // Default to dark theme on error
        }
    }
    /**
     * Get the appropriate icon name based on the current theme and state
     * @param state The current state ('idle', 'active', 'error')
     * @returns The icon name to use
     */
    static getThemeAwareIconName(state) {
        const themeType = this.getCurrentThemeType();
        // Base icon name based on state
        let baseIconName = 'kiro-icon'; // default
        switch (state.toLowerCase()) {
            case 'idle':
                baseIconName = 'kiro-idle';
                break;
            case 'active':
            case 'executing':
                baseIconName = 'kiro-active';
                break;
            case 'error':
                baseIconName = 'kiro-error';
                break;
        }
        // For now, we're using the same icon for all themes
        // In the future, we could have theme-specific icons like:
        // return `${baseIconName}-${themeType}`;
        return baseIconName;
    }
    /**
     * Get the fallback emoji character based on state
     * @param state The current state ('idle', 'active', 'error')
     * @returns The appropriate emoji character
     */
    static getFallbackEmoji(state) {
        switch (state.toLowerCase()) {
            case 'idle':
                return '👻';
            case 'active':
            case 'executing':
                return '⚡';
            case 'error':
                return '⚠️';
            default:
                return '👻';
        }
    }
}
exports.SvgIconUtils = SvgIconUtils;
// Theme type constants
SvgIconUtils.THEME_LIGHT = 'light';
SvgIconUtils.THEME_DARK = 'dark';
SvgIconUtils.THEME_HIGH_CONTRAST = 'high-contrast';
//# sourceMappingURL=SvgIconUtils.js.map