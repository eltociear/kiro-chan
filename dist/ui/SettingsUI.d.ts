import { SettingsManager } from '../settings/SettingsManager';
import { StatusBarCharacter } from '../StatusBarCharacter';
export declare class SettingsUI {
    private settingsManager;
    private statusBarCharacter;
    private modal;
    private isVisible;
    constructor(settingsManager: SettingsManager, statusBarCharacter?: StatusBarCharacter);
    show(): void;
    hide(): void;
    private createModal;
    private createHeader;
    private createForm;
    private createFormGroup;
    private createPositionGroup;
    private createPreviewGroup;
    private createFooter;
    private addFormEventListeners;
    private updatePreview;
    private saveSettings;
    private resetToDefaults;
    private showFeedback;
    private addStyles;
    dispose(): void;
}
//# sourceMappingURL=SettingsUI.d.ts.map