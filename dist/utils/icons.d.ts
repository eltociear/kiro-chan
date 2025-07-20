import * as vscode from 'vscode';
export declare class IconManager {
    private context;
    private iconPath;
    constructor(context: vscode.ExtensionContext);
    getKiroIcon(): string;
    getStateIcon(state: string): string;
    getAnimationStates(): string[];
    getThemeIcon(): vscode.ThemeIcon;
    getIconUri(): vscode.Uri;
}
//# sourceMappingURL=icons.d.ts.map