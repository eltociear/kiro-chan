import * as vscode from 'vscode';
/**
 * Utility functions for working with SVG icons in the status bar
 */
export declare class SvgIconUtils {
    private static readonly THEME_LIGHT;
    private static readonly THEME_DARK;
    private static readonly THEME_HIGH_CONTRAST;
    /**
     * Get the URI for an SVG icon in the extension's images directory
     * @param context The extension context
     * @param iconFileName The SVG file name (e.g., 'kiro_1.svg')
     * @returns The URI string for the SVG icon or undefined if it cannot be resolved
     */
    static getSvgIconUri(context: vscode.ExtensionContext, iconFileName: string): string | undefined;
    /**
     * Get the status bar text with an SVG icon
     * @param context The extension context
     * @param state The current state ('idle', 'active', 'error')
     * @param text The text to display after the icon
     * @returns The formatted status bar text with icon
     */
    static getStatusBarTextWithIcon(context: vscode.ExtensionContext, state: string, text: string): string;
    /**
     * Check if a product icon is available
     * @param iconName The name of the icon as defined in package.json
     * @returns True if the icon is available, false otherwise
     */
    private static isProductIconAvailable;
    /**
     * Check if SVG icons are supported in the current VS Code version
     * @returns True if SVG icons are supported, false otherwise
     */
    static isSvgIconSupported(): boolean;
    /**
     * Get the current VS Code theme type
     * @returns The current theme type: 'light', 'dark', or 'high-contrast'
     */
    static getCurrentThemeType(): string;
    /**
     * Get the appropriate icon name based on the current theme and state
     * @param state The current state ('idle', 'active', 'error')
     * @returns The icon name to use
     */
    static getThemeAwareIconName(state: string): string;
    /**
     * Get the fallback emoji character based on state
     * @param state The current state ('idle', 'active', 'error')
     * @returns The appropriate emoji character
     */
    static getFallbackEmoji(state: string): string;
}
//# sourceMappingURL=SvgIconUtils.d.ts.map