import * as vscode from 'vscode';
export declare class IconManager {
    private context;
    constructor(context: vscode.ExtensionContext);
    getKiroIconPath(): vscode.Uri;
    createStatusBarItemWithIcon(): vscode.StatusBarItem;
    getAnimationStates(): string[];
    getStateIcon(state: string): string;
}
//# sourceMappingURL=icons.d.ts.map