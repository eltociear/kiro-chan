import * as vscode from 'vscode';
import { StatusBarCharacterVSCode } from './StatusBarCharacterVSCode';
import { ErrorHandler } from './error/ErrorHandler';

let statusBarCharacter: StatusBarCharacterVSCode | null = null;

// Extension entry point
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    console.log('[Extension] Kiro Status Character extension activating...');
    
    // Register commands
    registerCommands(context);
    
    // Create and initialize the status bar character
    statusBarCharacter = new StatusBarCharacterVSCode();
    await statusBarCharacter.initialize();
    
    // Add to subscriptions for proper cleanup
    context.subscriptions.push({
      dispose: () => {
        if (statusBarCharacter) {
          statusBarCharacter.dispose();
        }
      }
    });
    
    console.log('[Extension] Kiro Status Character extension activated successfully');
  } catch (error) {
    console.error('[Extension] Failed to activate Kiro Status Character extension:', error);
    ErrorHandler.handleInitializationError(error as Error, {
      phase: 'activation'
    });
    
    // Don't throw the error to prevent extension system issues
    // Instead, log it and continue with minimal functionality
    if (statusBarCharacter) {
      statusBarCharacter.dispose();
      statusBarCharacter = null;
    }
  }
}

export function deactivate(): void {
  try {
    console.log('[Extension] Kiro Status Character extension deactivating...');
    
    if (statusBarCharacter) {
      statusBarCharacter.dispose();
      statusBarCharacter = null;
    }
    
    // Clear error handler instance
    ErrorHandler.resetInstance();
    
    console.log('[Extension] Kiro Status Character extension deactivated successfully');
  } catch (error) {
    console.error('[Extension] Error during deactivation:', error);
    // Don't throw during deactivation to avoid system issues
  }
}

// Export the status bar character instance for testing/debugging
export function getStatusBarCharacter(): StatusBarCharacterVSCode | null {
  return statusBarCharacter;
}

// Utility function to check if extension is active
export function isActive(): boolean {
  return statusBarCharacter !== null;
}

// Utility function to restart the extension
export async function restart(context?: vscode.ExtensionContext): Promise<void> {
  console.log('[Extension] Restarting Kiro Status Character extension...');
  
  deactivate();
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  
  if (context) {
    await activate(context);
  }
}

// Register commands
function registerCommands(context: vscode.ExtensionContext): void {
  // 設定を開くコマンド
  const openSettingsCommand = vscode.commands.registerCommand('kiro-chan.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'kiro-chan');
  });

  // 状態を手動で変更するコマンド（デバッグ用）
  const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
    if (statusBarCharacter) {
      statusBarCharacter.updateState(require('./types').KiroState.IDLE);
      vscode.window.showInformationMessage('Kiro Character: Idle state');
    }
  });

  const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
    if (statusBarCharacter) {
      statusBarCharacter.updateState(require('./types').KiroState.EXECUTING);
      vscode.window.showInformationMessage('Kiro Character: Active state');
    }
  });

  const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
    if (statusBarCharacter) {
      statusBarCharacter.updateState(require('./types').KiroState.ERROR);
      vscode.window.showInformationMessage('Kiro Character: Error state');
    }
  });

  context.subscriptions.push(
    openSettingsCommand,
    setIdleCommand,
    setActiveCommand,
    setErrorCommand
  );
}
