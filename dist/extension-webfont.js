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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let statusBarItem;
let decorationType;
function activate(context) {
    console.log('🚀 Kiro-Chan WebFont extension is activating...');
    // Create a custom CSS with the SVG as a background
    const customCSS = `
    @font-face {
        font-family: 'KiroIcon';
        src: url('${vscode.Uri.file(path.join(context.extensionPath, 'images', 'kiro-icon.woff2')).toString()}') format('woff2');
    }
    
    .kiro-icon::before {
        content: '\\e000';
        font-family: 'KiroIcon';
        font-size: 14px;
    }
    `;
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.openSettings';
    statusBarItem.tooltip = 'Kiro Character - Click for settings';
    // Use a special character that we'll replace with CSS
    statusBarItem.text = '⬜ Kiro';
    statusBarItem.show();
    // Register decoration type for custom rendering
    decorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: '',
            width: '16px',
            height: '16px',
            backgroundImage: vscode.Uri.file(path.join(context.extensionPath, 'images', 'kiro_1.svg')).toString(),
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
        }
    });
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(decorationType);
}
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (decorationType) {
        decorationType.dispose();
    }
}
//# sourceMappingURL=extension-webfont.js.map