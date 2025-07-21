import * as vscode from 'vscode';
import { KiroState } from './types';
import { SvgIconUtils } from './utils/SvgIconUtils';

let statusBarItem: vscode.StatusBarItem | null = null;
let animationInterval: NodeJS.Timeout | null = null;
let currentState: KiroState = KiroState.IDLE;
let animationFrame: number = 0;
let extensionContext: vscode.ExtensionContext | null = null;

// Extension entry point
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    console.log('[Extension] Kiro Status Character extension activating...');
    
    // Store the extension context for later use
    extensionContext = context;
    
    // Create status bar item immediately
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.openSettings';
    statusBarItem.tooltip = 'Kiro Character - Click to open settings';
    
    // Show immediately with default state
    updateStatusBar();
    statusBarItem.show();
    
    // Start animation
    startAnimation();
    
    // Register commands
    registerCommands(context);
    
    // Add to subscriptions for proper cleanup
    context.subscriptions.push(statusBarItem);
    
    // Listen for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('kiro-chan')) {
        handleConfigurationChange();
      }
    });
    context.subscriptions.push(configWatcher);
    
    console.log('[Extension] Kiro Status Character extension activated successfully');
    vscode.window.showInformationMessage('Kiro Character is now active in the status bar!');
  } catch (error) {
    console.error('[Extension] Failed to activate Kiro Status Character extension:', error);
    vscode.window.showErrorMessage(`Kiro Character activation failed: ${error}`);
  }
}

export function deactivate(): void {
  try {
    console.log('[Extension] Kiro Status Character extension deactivating...');
    
    // Stop animation
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    // Dispose status bar item
    if (statusBarItem) {
      statusBarItem.dispose();
      statusBarItem = null;
    }
    
    console.log('[Extension] Kiro Status Character extension deactivated successfully');
  } catch (error) {
    console.error('[Extension] Error during deactivation:', error);
  }
}

// Animation and state management functions
function updateStatusBar(): void {
  if (!statusBarItem) return;
  
  const stateText = getStateText();
  
  try {
    if (extensionContext) {
      // Use SVG icon if extension context is available
      statusBarItem.text = SvgIconUtils.getStatusBarTextWithIcon(
        extensionContext,
        'kiro_1.svg',
        'Kiro',
        getAnimatedCharacter() // Fallback to emoji if SVG fails
      );
    } else {
      // Fallback to emoji character if no extension context
      const character = getAnimatedCharacter();
      statusBarItem.text = `${character} Kiro`;
    }
    
    statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
  } catch (error) {
    // If any error occurs, fall back to the emoji character
    const character = getAnimatedCharacter();
    statusBarItem.text = `${character} Kiro`;
    statusBarItem.tooltip = `Kiro Character (${stateText}) - Click to open settings`;
    
    console.error('[Extension] Error updating status bar:', error);
  }
}

function getAnimatedCharacter(): string {
  const frame = animationFrame % 8;
  
  switch (currentState) {
    case KiroState.IDLE:
      // Gentle animation - slower changes
      if (frame < 4) return '👻';
      else if (frame < 6) return '🌟';
      else return '✨';
      
    case KiroState.EXECUTING:
      // Active animation - faster changes
      const activeChars = ['👻', '⚡', '🔥', '✨', '🚀', '💫', '⭐', '🌟'];
      return activeChars[frame];
      
    case KiroState.ERROR:
      // Error animation - warning indicators
      return frame % 2 === 0 ? '👻' : '⚠️';
      
    default:
      return '👻';
  }
}

function getStateText(): string {
  switch (currentState) {
    case KiroState.IDLE:
      return 'Idle';
    case KiroState.EXECUTING:
      return 'Active';
    case KiroState.ERROR:
      return 'Error';
    default:
      return 'Unknown';
  }
}

function startAnimation(): void {
  if (animationInterval) return;
  
  const config = vscode.workspace.getConfiguration('kiro-chan');
  const enabled = config.get<boolean>('enabled', true);
  const speed = config.get<number>('animationSpeed', 1.0);
  
  if (!enabled) return;
  
  // For SVG icon, we can reduce the animation rate since we're primarily using it for state changes
  // rather than animation frames
  const frameRate = Math.max(1, Math.min(5, speed * 1)); // 1-5 fps is sufficient for state changes
  const frameTime = 1000 / frameRate;
  
  animationInterval = setInterval(() => {
    animationFrame++;
    updateStatusBar();
  }, frameTime);
}

function stopAnimation(): void {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
}

function handleConfigurationChange(): void {
  const config = vscode.workspace.getConfiguration('kiro-chan');
  const enabled = config.get<boolean>('enabled', true);
  
  if (enabled) {
    if (statusBarItem) {
      statusBarItem.show();
      startAnimation();
    }
  } else {
    if (statusBarItem) {
      statusBarItem.hide();
      stopAnimation();
    }
  }
}

// Utility functions
export function isActive(): boolean {
  return statusBarItem !== null;
}

export function getCurrentState(): KiroState {
  return currentState;
}

export function setCurrentState(state: KiroState): void {
  currentState = state;
  updateStatusBar();
}

// Register commands
function registerCommands(context: vscode.ExtensionContext): void {
  // 設定を開くコマンド
  const openSettingsCommand = vscode.commands.registerCommand('kiro-chan.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'kiro-chan');
  });

  // 状態を手動で変更するコマンド（デバッグ用）
  const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
    setCurrentState(KiroState.IDLE);
    vscode.window.showInformationMessage('👻 Kiro Character: Idle state');
  });

  const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
    setCurrentState(KiroState.EXECUTING);
    vscode.window.showInformationMessage('⚡ Kiro Character: Active state');
  });

  const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
    setCurrentState(KiroState.ERROR);
    vscode.window.showInformationMessage('⚠️ Kiro Character: Error state');
  });

  context.subscriptions.push(
    openSettingsCommand,
    setIdleCommand,
    setActiveCommand,
    setErrorCommand
  );
}
