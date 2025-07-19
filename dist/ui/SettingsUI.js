"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsUI = void 0;
const ErrorHandler_1 = require("../error/ErrorHandler");
class SettingsUI {
    constructor(settingsManager, statusBarCharacter) {
        this.modal = null;
        this.isVisible = false;
        this.settingsManager = settingsManager;
        this.statusBarCharacter = statusBarCharacter || null;
    }
    show() {
        try {
            if (this.isVisible) {
                return;
            }
            this.createModal();
            this.isVisible = true;
            if (this.modal) {
                document.body.appendChild(this.modal);
                // Focus the modal for accessibility
                this.modal.focus();
            }
        }
        catch (error) {
            ErrorHandler_1.ErrorHandler.handleDomError(error, {
                action: 'showSettingsUI'
            });
        }
    }
    hide() {
        try {
            if (!this.isVisible || !this.modal) {
                return;
            }
            if (this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.modal = null;
            this.isVisible = false;
        }
        catch (error) {
            ErrorHandler_1.ErrorHandler.handleDomError(error, {
                action: 'hideSettingsUI'
            });
        }
    }
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'kiro-settings-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'kiro-settings-title');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.tabIndex = -1;
        const overlay = document.createElement('div');
        overlay.className = 'kiro-settings-overlay';
        overlay.addEventListener('click', () => this.hide());
        const content = document.createElement('div');
        content.className = 'kiro-settings-content';
        content.addEventListener('click', (e) => e.stopPropagation());
        const header = this.createHeader();
        const form = this.createForm();
        const footer = this.createFooter();
        content.appendChild(header);
        content.appendChild(form);
        content.appendChild(footer);
        this.modal.appendChild(overlay);
        this.modal.appendChild(content);
        // Add styles
        this.addStyles();
        // Handle escape key
        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }
    createHeader() {
        const header = document.createElement('div');
        header.className = 'kiro-settings-header';
        const title = document.createElement('h2');
        title.id = 'kiro-settings-title';
        title.textContent = 'Kiro Character Settings';
        const closeButton = document.createElement('button');
        closeButton.className = 'kiro-settings-close';
        closeButton.textContent = '×';
        closeButton.setAttribute('aria-label', 'Close settings');
        closeButton.addEventListener('click', () => this.hide());
        header.appendChild(title);
        header.appendChild(closeButton);
        return header;
    }
    createForm() {
        const form = document.createElement('form');
        form.className = 'kiro-settings-form';
        // Enabled toggle
        const enabledGroup = this.createFormGroup('enabled', 'Enable Character', 'checkbox', this.settingsManager.isEnabled());
        form.appendChild(enabledGroup);
        // Animation speed slider
        const speedGroup = this.createFormGroup('animationSpeed', 'Animation Speed', 'range', this.settingsManager.getAnimationSpeed(), { min: '0.1', max: '3.0', step: '0.1' });
        form.appendChild(speedGroup);
        // Position radio buttons
        const positionGroup = this.createPositionGroup();
        form.appendChild(positionGroup);
        // Preview area
        const previewGroup = this.createPreviewGroup();
        form.appendChild(previewGroup);
        // Add event listeners
        this.addFormEventListeners(form);
        return form;
    }
    createFormGroup(id, label, type, value, attributes) {
        const group = document.createElement('div');
        group.className = 'kiro-settings-group';
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;
        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        if (type === 'checkbox') {
            input.checked = value;
        }
        else {
            input.value = value;
        }
        if (attributes) {
            Object.entries(attributes).forEach(([key, val]) => {
                input.setAttribute(key, val);
            });
        }
        group.appendChild(labelElement);
        group.appendChild(input);
        // Add value display for range inputs
        if (type === 'range') {
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'kiro-settings-value';
            valueDisplay.textContent = value.toString();
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value;
            });
            group.appendChild(valueDisplay);
        }
        return group;
    }
    createPositionGroup() {
        const group = document.createElement('div');
        group.className = 'kiro-settings-group';
        const label = document.createElement('label');
        label.textContent = 'Position';
        const radioGroup = document.createElement('div');
        radioGroup.className = 'kiro-settings-radio-group';
        const positions = [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' }
        ];
        const currentPosition = this.settingsManager.getPosition();
        positions.forEach(pos => {
            const radioWrapper = document.createElement('div');
            radioWrapper.className = 'kiro-settings-radio-wrapper';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `position-${pos.value}`;
            radio.name = 'position';
            radio.value = pos.value;
            radio.checked = pos.value === currentPosition;
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `position-${pos.value}`;
            radioLabel.textContent = pos.label;
            radioWrapper.appendChild(radio);
            radioWrapper.appendChild(radioLabel);
            radioGroup.appendChild(radioWrapper);
        });
        group.appendChild(label);
        group.appendChild(radioGroup);
        return group;
    }
    createPreviewGroup() {
        const group = document.createElement('div');
        group.className = 'kiro-settings-group kiro-settings-preview-group';
        const label = document.createElement('label');
        label.textContent = 'Preview';
        const preview = document.createElement('div');
        preview.className = 'kiro-settings-preview';
        preview.innerHTML = '<span class="kiro-character">👻</span>';
        group.appendChild(label);
        group.appendChild(preview);
        return group;
    }
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'kiro-settings-footer';
        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'kiro-settings-button kiro-settings-button-primary';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => this.saveSettings());
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'kiro-settings-button kiro-settings-button-secondary';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => this.hide());
        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = 'kiro-settings-button kiro-settings-button-danger';
        resetButton.textContent = 'Reset to Defaults';
        resetButton.addEventListener('click', () => this.resetToDefaults());
        footer.appendChild(resetButton);
        footer.appendChild(cancelButton);
        footer.appendChild(saveButton);
        return footer;
    }
    addFormEventListeners(form) {
        // Real-time preview updates
        const enabledInput = form.querySelector('#enabled');
        const speedInput = form.querySelector('#animationSpeed');
        const positionInputs = form.querySelectorAll('input[name="position"]');
        if (enabledInput) {
            enabledInput.addEventListener('change', () => this.updatePreview());
        }
        if (speedInput) {
            speedInput.addEventListener('input', () => this.updatePreview());
        }
        positionInputs.forEach(input => {
            input.addEventListener('change', () => this.updatePreview());
        });
    }
    updatePreview() {
        if (!this.modal)
            return;
        const form = this.modal.querySelector('.kiro-settings-form');
        const preview = this.modal.querySelector('.kiro-settings-preview .kiro-character');
        if (!form || !preview)
            return;
        const enabled = form.querySelector('#enabled')?.checked;
        const speed = parseFloat(form.querySelector('#animationSpeed')?.value || '1');
        if (enabled) {
            preview.style.opacity = '1';
            preview.style.animationDuration = `${2 / speed}s`;
        }
        else {
            preview.style.opacity = '0.5';
            preview.style.animation = 'none';
        }
    }
    async saveSettings() {
        try {
            if (!this.modal)
                return;
            const form = this.modal.querySelector('.kiro-settings-form');
            if (!form)
                return;
            // Get form values
            const enabled = form.querySelector('#enabled')?.checked ?? true;
            const speed = parseFloat(form.querySelector('#animationSpeed')?.value || '1');
            const positionInput = form.querySelector('input[name="position"]:checked');
            const position = positionInput?.value || 'right';
            // Update settings
            this.settingsManager.setEnabled(enabled);
            this.settingsManager.setAnimationSpeed(speed);
            this.settingsManager.setPosition(position);
            // Save to storage
            await this.settingsManager.saveSettings();
            // Apply changes to status bar character
            if (this.statusBarCharacter) {
                this.statusBarCharacter.refreshSettings();
            }
            // Show success feedback
            this.showFeedback('Settings saved successfully!', 'success');
            // Close modal after a short delay
            setTimeout(() => this.hide(), 1000);
        }
        catch (error) {
            ErrorHandler_1.ErrorHandler.handleSettingsError(error, {
                action: 'saveSettings'
            });
            this.showFeedback('Failed to save settings. Please try again.', 'error');
        }
    }
    resetToDefaults() {
        try {
            if (!this.modal)
                return;
            const form = this.modal.querySelector('.kiro-settings-form');
            if (!form)
                return;
            // Reset form to default values
            form.querySelector('#enabled').checked = true;
            form.querySelector('#animationSpeed').value = '1.0';
            form.querySelector('#position-right').checked = true;
            // Update value display
            const valueDisplay = form.querySelector('.kiro-settings-value');
            if (valueDisplay) {
                valueDisplay.textContent = '1.0';
            }
            // Update preview
            this.updatePreview();
            this.showFeedback('Settings reset to defaults', 'info');
        }
        catch (error) {
            ErrorHandler_1.ErrorHandler.handleSettingsError(error, {
                action: 'resetToDefaults'
            });
        }
    }
    showFeedback(message, type) {
        if (!this.modal)
            return;
        const existing = this.modal.querySelector('.kiro-settings-feedback');
        if (existing) {
            existing.remove();
        }
        const feedback = document.createElement('div');
        feedback.className = `kiro-settings-feedback kiro-settings-feedback-${type}`;
        feedback.textContent = message;
        const content = this.modal.querySelector('.kiro-settings-content');
        if (content) {
            content.appendChild(feedback);
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 3000);
        }
    }
    addStyles() {
        if (document.querySelector('#kiro-settings-styles')) {
            return; // Styles already added
        }
        const style = document.createElement('style');
        style.id = 'kiro-settings-styles';
        style.textContent = `
      .kiro-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kiro-settings-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .kiro-settings-content {
        position: relative;
        background: var(--vscode-editor-background, #1e1e1e);
        color: var(--vscode-editor-foreground, #d4d4d4);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        width: 400px;
        max-width: 90vw;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .kiro-settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
      }

      .kiro-settings-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .kiro-settings-close {
        background: none;
        border: none;
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .kiro-settings-close:hover {
        background: var(--vscode-toolbar-hoverBackground, #2a2d2e);
      }

      .kiro-settings-form {
        padding: 20px;
      }

      .kiro-settings-group {
        margin-bottom: 20px;
      }

      .kiro-settings-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .kiro-settings-group input[type="checkbox"] {
        margin-right: 8px;
      }

      .kiro-settings-group input[type="range"] {
        width: 100%;
        margin-right: 12px;
      }

      .kiro-settings-value {
        font-weight: 600;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .kiro-settings-radio-group {
        display: flex;
        gap: 16px;
      }

      .kiro-settings-radio-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .kiro-settings-preview-group {
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 4px;
        padding: 16px;
        background: var(--vscode-input-background, #3c3c3c);
      }

      .kiro-settings-preview {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
        font-size: 24px;
      }

      .kiro-settings-preview .kiro-character {
        animation: gentle-float 2s ease-in-out infinite;
      }

      @keyframes gentle-float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-3px) rotate(1deg); }
      }

      .kiro-settings-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--vscode-panel-border, #3c3c3c);
      }

      .kiro-settings-button {
        padding: 8px 16px;
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }

      .kiro-settings-button-primary {
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
      }

      .kiro-settings-button-primary:hover {
        background: var(--vscode-button-hoverBackground, #1177bb);
      }

      .kiro-settings-button-secondary {
        background: var(--vscode-button-secondaryBackground, #3c3c3c);
        color: var(--vscode-button-secondaryForeground, #cccccc);
      }

      .kiro-settings-button-secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground, #45494a);
      }

      .kiro-settings-button-danger {
        background: transparent;
        color: var(--vscode-errorForeground, #f48771);
        border-color: var(--vscode-errorForeground, #f48771);
      }

      .kiro-settings-button-danger:hover {
        background: var(--vscode-errorForeground, #f48771);
        color: var(--vscode-button-foreground, #ffffff);
      }

      .kiro-settings-feedback {
        margin-top: 16px;
        padding: 12px;
        border-radius: 4px;
        font-size: 14px;
      }

      .kiro-settings-feedback-success {
        background: var(--vscode-inputValidation-infoBackground, #063b49);
        color: var(--vscode-inputValidation-infoForeground, #75beff);
        border: 1px solid var(--vscode-inputValidation-infoBorder, #007acc);
      }

      .kiro-settings-feedback-error {
        background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
        color: var(--vscode-inputValidation-errorForeground, #f48771);
        border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
      }

      .kiro-settings-feedback-info {
        background: var(--vscode-inputValidation-warningBackground, #352a05);
        color: var(--vscode-inputValidation-warningForeground, #ffcc02);
        border: 1px solid var(--vscode-inputValidation-warningBorder, #b89500);
      }
    `;
        document.head.appendChild(style);
    }
    dispose() {
        this.hide();
        // Remove styles
        const styles = document.querySelector('#kiro-settings-styles');
        if (styles) {
            styles.remove();
        }
    }
}
exports.SettingsUI = SettingsUI;
//# sourceMappingURL=SettingsUI.js.map