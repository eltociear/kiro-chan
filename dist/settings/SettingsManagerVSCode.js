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
exports.SettingsManagerVSCode = void 0;
const vscode = __importStar(require("vscode"));
class SettingsManagerVSCode {
    constructor() {
        this.configSection = 'kiro-chan';
    }
    isEnabled() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get('enabled', true);
    }
    setEnabled(enabled) {
        const config = vscode.workspace.getConfiguration(this.configSection);
        config.update('enabled', enabled, vscode.ConfigurationTarget.Global);
    }
    getAnimationSpeed() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get('animationSpeed', 1.0);
    }
    setAnimationSpeed(speed) {
        if (speed < 0.1 || speed > 3.0) {
            throw new Error('Animation speed must be between 0.1 and 3.0');
        }
        const config = vscode.workspace.getConfiguration(this.configSection);
        config.update('animationSpeed', speed, vscode.ConfigurationTarget.Global);
    }
    getPosition() {
        // VS CodeのStatusBarItemは位置をAlignmentで制御するため、
        // この設定は使用しないが、互換性のため残す
        return 'right';
    }
    setPosition(position) {
        // VS CodeのStatusBarItemでは位置変更は制限されるため、
        // 実装は空にする
    }
    async loadSettings() {
        // VS Codeの設定は自動的に読み込まれるため、特別な処理は不要
        return Promise.resolve();
    }
    async saveSettings() {
        // VS Codeの設定は自動的に保存されるため、特別な処理は不要
        return Promise.resolve();
    }
    getBackgroundColor() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        return config.get('backgroundColor', '#007ACC');
    }
    setBackgroundColor(color) {
        const config = vscode.workspace.getConfiguration(this.configSection);
        config.update('backgroundColor', color, vscode.ConfigurationTarget.Global);
    }
    getSettings() {
        return {
            enabled: this.isEnabled(),
            animationSpeed: this.getAnimationSpeed(),
            position: this.getPosition(),
            backgroundColor: this.getBackgroundColor()
        };
    }
    // VS Code設定変更の監視
    onConfigurationChanged(callback) {
        return vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(this.configSection)) {
                callback();
            }
        });
    }
}
exports.SettingsManagerVSCode = SettingsManagerVSCode;
//# sourceMappingURL=SettingsManagerVSCode.js.map