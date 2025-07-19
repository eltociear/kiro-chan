import { StatusBarCharacter } from './StatusBarCharacter';
import { ErrorHandler } from './error/ErrorHandler';

let statusBarCharacter: StatusBarCharacter | null = null;

// Extension entry point
export async function activate(): Promise<void> {
  try {
    console.log('[Extension] Kiro Status Character extension activating...');
    
    // Create and initialize the status bar character
    statusBarCharacter = new StatusBarCharacter();
    await statusBarCharacter.initialize();
    
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
export function getStatusBarCharacter(): StatusBarCharacter | null {
  return statusBarCharacter;
}

// Utility function to check if extension is active
export function isActive(): boolean {
  return statusBarCharacter !== null;
}

// Utility function to restart the extension
export async function restart(): Promise<void> {
  console.log('[Extension] Restarting Kiro Status Character extension...');
  
  deactivate();
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  await activate();
}
