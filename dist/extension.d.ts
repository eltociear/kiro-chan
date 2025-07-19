import * as vscode from 'vscode';
import { KiroState } from './types';
export declare function activate(context: vscode.ExtensionContext): Promise<void>;
export declare function deactivate(): void;
export declare function isActive(): boolean;
export declare function getCurrentState(): KiroState;
export declare function setCurrentState(state: KiroState): void;
//# sourceMappingURL=extension.d.ts.map