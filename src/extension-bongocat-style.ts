import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let animationTimer: NodeJS.Timeout | undefined;
let activeAnimationTimer: NodeJS.Timeout | undefined;
let colorMaintainTimer: NodeJS.Timeout | undefined;
let hoverDetectionTimer: NodeJS.Timeout | undefined;
let rainbowTimer: NodeJS.Timeout | undefined;
let diagnosticsDisposable: vscode.Disposable | undefined;
let activeEditorDisposable: vscode.Disposable | undefined;
let animationFrame = 0;
let statusBarVisible = true;
let isActiveState = false;
let lastActivityTime = Date.now();
let inactivityCheckTimer: NodeJS.Timeout | undefined;
let currentHue = 0;
let hasErrors = false;
const TASK_COMPLETE_THRESHOLD = 10000; // 10 seconds of inactivity = task complete

// Icon states for different Kiro animations
const KIRO_ICONS = {
    idle: 'kiro-idle',       // \e900
    active: 'kiro-active',   // \e901
    error: 'kiro-error',     // \e902
    complete: 'kiro-complete', // \e903
    standby: 'kiro-standby'  // \e904
};

// Animation sequence for active state (when typing): \e900, \e901, \e902
const ACTIVE_SEQUENCE = [
    KIRO_ICONS.idle,     // \e900
    KIRO_ICONS.active,   // \e901
    KIRO_ICONS.error     // \e902
];

// Animation sequence for standby state: \e903, \e904
const STANDBY_SEQUENCE = [
    KIRO_ICONS.complete, // \e903
    KIRO_ICONS.standby   // \e904
];

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Kiro-Chan BongoCat-style extension is activating...');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'kiro-chan.toggleStatusBar';
    statusBarItem.tooltip = 'Kiro Character - Click to toggle';
    
    // Show initial state
    updateStatusBarIcon(KIRO_ICONS.complete);
    showStatusBar();
    
    // Start color maintenance to prevent hover effects
    startColorMaintenance();
    
    // Start hover detection for immediate color restoration
    startHoverDetection();
    
    // Start standby animation
    startStandbyAnimation();

    // Check if rainbow mode is enabled and start it
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (config.get('rainbowMode', false)) {
        startRainbowAnimation();
    }

    // Setup diagnostics listener for error detection
    setupDiagnosticsListener();

    // Listen for text document changes (similar to BongoCat)
    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (statusBarVisible && event.contentChanges.length > 0) {
            // Update last activity time
            lastActivityTime = Date.now();
            
            // Switch to active animation sequence when typing
            startActiveAnimation();
            
            // Reset to standby animation after delay
            if (activeAnimationTimer) {
                clearTimeout(activeAnimationTimer);
            }
            activeAnimationTimer = setTimeout(() => {
                startStandbyAnimation();
            }, 2000);
        }
    });
    
    // Start inactivity checker
    startInactivityChecker(context);
    
    // Listen for configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('kiro-chan.displayColor')) {
            console.log('Display color setting changed, updating status bar...');
            applyDisplayColor();
        }
        if (event.affectsConfiguration('kiro-chan.rainbowMode') || event.affectsConfiguration('kiro-chan.rainbowSpeed')) {
            console.log('Rainbow mode setting changed, updating animation...');
            const config = vscode.workspace.getConfiguration('kiro-chan');
            const rainbowMode = config.get('rainbowMode', false);
            if (rainbowMode) {
                startRainbowAnimation();
            } else {
                stopRainbowAnimation();
            }
        }
        if (event.affectsConfiguration('kiro-chan.diagnosticsEnabled')) {
            console.log('Diagnostics setting changed, updating...');
            const config = vscode.workspace.getConfiguration('kiro-chan');
            if (config.get('diagnosticsEnabled', true)) {
                setupDiagnosticsListener();
            } else {
                stopDiagnosticsListener();
            }
        }
    });
    
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('kiro-chan.toggleStatusBar', () => {
        statusBarVisible = !statusBarVisible;
        if (statusBarVisible) {
            showStatusBar();
            startStandbyAnimation();
            vscode.window.showInformationMessage('Kiro Character is now visible');
        } else {
            hideStatusBar();
            stopAllAnimations();
            vscode.window.showInformationMessage('Kiro Character is now hidden');
        }
    });
    
    const setIdleCommand = vscode.commands.registerCommand('kiro-chan.setIdle', () => {
        updateStatusBarIcon(KIRO_ICONS.idle);
        vscode.window.showInformationMessage('Kiro: Idle state');
    });

    const setActiveCommand = vscode.commands.registerCommand('kiro-chan.setActive', () => {
        updateStatusBarIcon(KIRO_ICONS.active);
        vscode.window.showInformationMessage('Kiro: Active state');
    });

    const setErrorCommand = vscode.commands.registerCommand('kiro-chan.setError', () => {
        updateStatusBarIcon(KIRO_ICONS.error);
        vscode.window.showInformationMessage('Kiro: Error state');
    });
    
    const setCompleteCommand = vscode.commands.registerCommand('kiro-chan.setComplete', () => {
        updateStatusBarIcon(KIRO_ICONS.complete);
        vscode.window.showInformationMessage('Kiro: Task completed!');
    });

    // Add to subscriptions
    context.subscriptions.push(
        statusBarItem,
        textChangeDisposable,
        configChangeDisposable,
        toggleCommand,
        setIdleCommand,
        setActiveCommand,
        setErrorCommand,
        setCompleteCommand
    );

    console.log('✅ Kiro-Chan BongoCat-style extension activated successfully!');
}

function updateStatusBarIcon(iconName: string) {
    if (statusBarItem) {
        // Use the BongoCat-style $(icon-name) format
        const appName = vscode.env.appName;
        statusBarItem.text = `$(${iconName}) ${appName}`;
        
        // Apply text color based on backgroundColor setting
        applyTextColor();
        
        // Force re-apply color multiple times after text update
        setTimeout(() => {
            applyTextColor();
        }, 1);
        
        setTimeout(() => {
            applyTextColor();
        }, 10);
        
        setTimeout(() => {
            applyTextColor();
        }, 50);
        
        console.log(`Updated status bar icon to: $(${iconName}) ${appName}`);
    }
}

function applyTextColor() {
    if (statusBarItem) {
        const config = vscode.workspace.getConfiguration('kiro-chan');

        // Skip if rainbow mode is enabled
        if (config.get('rainbowMode', false)) {
            return;
        }

        const displayColor = config.get('displayColor', '#FFFFFF');

        // Apply the color multiple times to ensure it sticks
        statusBarItem.color = displayColor;
        statusBarItem.color = displayColor;
        statusBarItem.color = displayColor;

        // Force immediate re-application
        setTimeout(() => {
            if (statusBarItem) {
                const config = vscode.workspace.getConfiguration('kiro-chan');
                if (config.get('rainbowMode', false)) {
                    return;
                }
                statusBarItem.color = displayColor;
                statusBarItem.color = displayColor;
            }
        }, 1);

        console.log(`Applied display color: ${displayColor}`);
    }
}

function startColorMaintenance() {
    // Continuously re-apply color to prevent hover effects from overriding it
    if (colorMaintainTimer) {
        clearInterval(colorMaintainTimer);
    }

    // Don't start color maintenance if rainbow mode is enabled
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (config.get('rainbowMode', false)) {
        return;
    }

    colorMaintainTimer = setInterval(() => {
        if (statusBarItem && statusBarVisible) {
            const config = vscode.workspace.getConfiguration('kiro-chan');

            // Skip if rainbow mode is enabled
            if (config.get('rainbowMode', false)) {
                return;
            }

            const displayColor = config.get('displayColor', '#FFFFFF');

            // Force re-apply color multiple times to maintain consistency
            statusBarItem.color = displayColor;
            statusBarItem.color = displayColor;
            statusBarItem.color = displayColor;

            // Additional immediate re-application
            setTimeout(() => {
                if (statusBarItem) {
                    const config = vscode.workspace.getConfiguration('kiro-chan');
                    if (config.get('rainbowMode', false)) {
                        return;
                    }
                    statusBarItem.color = displayColor;
                }
            }, 1);
        }
    }, 25); // Re-apply color every 25ms for more aggressive override of hover effects
}

function startHoverDetection() {
    // Ultra-fast hover detection and color restoration
    if (hoverDetectionTimer) {
        clearInterval(hoverDetectionTimer);
    }

    // Don't start hover detection if rainbow mode is enabled
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (config.get('rainbowMode', false)) {
        return;
    }

    hoverDetectionTimer = setInterval(() => {
        if (statusBarItem && statusBarVisible) {
            const config = vscode.workspace.getConfiguration('kiro-chan');

            // Skip if rainbow mode is enabled
            if (config.get('rainbowMode', false)) {
                return;
            }

            const displayColor = config.get('displayColor', '#FFFFFF');

            // Aggressively restore color to counter any hover effects
            for (let i = 0; i < 5; i++) {
                statusBarItem.color = displayColor;
            }

            // Multiple delayed re-applications
            setTimeout(() => {
                if (statusBarItem) {
                    const config = vscode.workspace.getConfiguration('kiro-chan');
                    if (config.get('rainbowMode', false)) {
                        return;
                    }
                    for (let i = 0; i < 3; i++) {
                        statusBarItem.color = displayColor;
                    }
                }
            }, 1);

            setTimeout(() => {
                if (statusBarItem) {
                    const config = vscode.workspace.getConfiguration('kiro-chan');
                    if (config.get('rainbowMode', false)) {
                        return;
                    }
                    statusBarItem.color = displayColor;
                }
            }, 5);
        }
    }, 10); // Check and restore color every 10ms for maximum responsiveness
}



function applyDisplayColor() {
    // Apply text color changes
    applyTextColor();
}

// HSL to Hex conversion function
function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function startRainbowAnimation() {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    const rainbowMode = config.get('rainbowMode', false);

    if (!rainbowMode) {
        stopRainbowAnimation();
        return;
    }

    // Stop existing rainbow timer if any
    if (rainbowTimer) {
        clearInterval(rainbowTimer);
    }

    // Stop color maintenance and hover detection timers as rainbow mode overrides them
    if (colorMaintainTimer) {
        clearInterval(colorMaintainTimer);
        colorMaintainTimer = undefined;
    }
    if (hoverDetectionTimer) {
        clearInterval(hoverDetectionTimer);
        hoverDetectionTimer = undefined;
    }

    const rainbowSpeed = config.get('rainbowSpeed', 50);

    rainbowTimer = setInterval(() => {
        if (statusBarItem && statusBarVisible) {
            // Increment hue (0-360)
            currentHue = (currentHue + 2) % 360;

            // Convert HSL to Hex (high saturation and medium lightness for vibrant colors)
            const rainbowColor = hslToHex(currentHue, 100, 50);

            // Apply the rainbow color
            statusBarItem.color = rainbowColor;
        }
    }, rainbowSpeed);

    console.log(`Rainbow animation started with speed: ${rainbowSpeed}ms`);
}

function stopRainbowAnimation() {
    if (rainbowTimer) {
        clearInterval(rainbowTimer);
        rainbowTimer = undefined;
    }

    // Restart color maintenance and hover detection
    startColorMaintenance();
    startHoverDetection();

    // Apply the static display color
    applyTextColor();

    console.log('Rainbow animation stopped');
}

// Diagnostics functions
function checkDiagnostics() {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (!config.get('diagnosticsEnabled', true)) {
        // If diagnostics disabled, clear background
        if (statusBarItem) {
            statusBarItem.backgroundColor = undefined;
        }
        hasErrors = false;
        return;
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        // No active editor, clear background
        if (statusBarItem) {
            statusBarItem.backgroundColor = undefined;
        }
        hasErrors = false;
        return;
    }

    const uri = activeEditor.document.uri;
    const diagnostics = vscode.languages.getDiagnostics(uri);

    // Check for errors (DiagnosticSeverity.Error = 0)
    const errorCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
    const warningCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length;

    if (statusBarItem) {
        if (errorCount > 0) {
            // Has errors - red background
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            hasErrors = true;
            console.log(`Diagnostics: ${errorCount} error(s) found`);
        } else if (warningCount > 0) {
            // Has warnings - yellow/warning background
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            hasErrors = false;
            console.log(`Diagnostics: ${warningCount} warning(s) found`);
        } else {
            // No errors or warnings - clear background
            statusBarItem.backgroundColor = undefined;
            hasErrors = false;
        }
    }
}

function setupDiagnosticsListener() {
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (!config.get('diagnosticsEnabled', true)) {
        return;
    }

    // Listen for diagnostics changes
    diagnosticsDisposable = vscode.languages.onDidChangeDiagnostics(() => {
        checkDiagnostics();
    });

    // Listen for active editor changes
    activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
        checkDiagnostics();
    });

    // Initial check
    checkDiagnostics();

    console.log('Diagnostics listener started');
}

function stopDiagnosticsListener() {
    if (diagnosticsDisposable) {
        diagnosticsDisposable.dispose();
        diagnosticsDisposable = undefined;
    }
    if (activeEditorDisposable) {
        activeEditorDisposable.dispose();
        activeEditorDisposable = undefined;
    }
    if (statusBarItem) {
        statusBarItem.backgroundColor = undefined;
    }
    hasErrors = false;
    console.log('Diagnostics listener stopped');
}

function showStatusBar() {
    if (statusBarItem) {
        statusBarItem.show();
    }
}

function hideStatusBar() {
    if (statusBarItem) {
        statusBarItem.hide();
    }
}

function startActiveAnimation() {
    stopAllAnimations();
    isActiveState = true;
    animationFrame = 0;
    
    // Active animation: cycle through \e900, \e901, \e902
    animationTimer = setInterval(() => {
        if (statusBarVisible && isActiveState) {
            animationFrame = (animationFrame + 1) % ACTIVE_SEQUENCE.length;
            updateStatusBarIcon(ACTIVE_SEQUENCE[animationFrame]);
        }
    }, 100); // Very fast animation when active
}

function startStandbyAnimation() {
    stopAllAnimations();
    isActiveState = false;
    animationFrame = 0;
    
    // Standby animation: cycle through \e903, \e904
    animationTimer = setInterval(() => {
        if (statusBarVisible && !isActiveState) {
            animationFrame = (animationFrame + 1) % STANDBY_SEQUENCE.length;
            updateStatusBarIcon(STANDBY_SEQUENCE[animationFrame]);
        }
    }, 1500); // Slower animation when standby
}

function stopAllAnimations() {
    // Stop icon animations only - rainbow animation is independent
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = undefined;
    }
    if (activeAnimationTimer) {
        clearTimeout(activeAnimationTimer);
        activeAnimationTimer = undefined;
    }
    if (inactivityCheckTimer) {
        clearInterval(inactivityCheckTimer);
        inactivityCheckTimer = undefined;
    }
    // Only stop color timers if rainbow mode is not active
    const config = vscode.workspace.getConfiguration('kiro-chan');
    if (!config.get('rainbowMode', false)) {
        if (colorMaintainTimer) {
            clearInterval(colorMaintainTimer);
            colorMaintainTimer = undefined;
        }
        if (hoverDetectionTimer) {
            clearInterval(hoverDetectionTimer);
            hoverDetectionTimer = undefined;
        }
    }
    // Note: Rainbow timer is NOT stopped here - it runs independently
}

function startInactivityChecker(context: vscode.ExtensionContext) {
    // Check for inactivity every second
    inactivityCheckTimer = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        
        // If user has been inactive for threshold time, show task complete notification
        if (timeSinceLastActivity >= TASK_COMPLETE_THRESHOLD && isActiveState === false) {
            // Get notification setting
            const config = vscode.workspace.getConfiguration('kiro-chan');
            const notificationEnabled = config.get('notificationEnabled', true);
            
            if (notificationEnabled) {
                // Show OS native notification
                vscode.window.showInformationMessage(
                    '🎉 Kiro Task Complete! Great job!',
                    { modal: false }
                ).then(() => {
                    // Optional: Change to complete animation briefly
                    updateStatusBarIcon(KIRO_ICONS.complete);
                    setTimeout(() => {
                        if (!isActiveState) {
                            startStandbyAnimation();
                        }
                    }, 3000);
                });
                
                // Reset last activity time to prevent repeated notifications
                lastActivityTime = Date.now();
            }
        }
    }, 1000);
}

export function deactivate() {
    console.log('🛑 Kiro-Chan BongoCat-style extension is deactivating...');

    stopAllAnimations();

    // Also stop rainbow timer on deactivate
    if (rainbowTimer) {
        clearInterval(rainbowTimer);
        rainbowTimer = undefined;
    }

    // Stop diagnostics listener
    stopDiagnosticsListener();

    if (statusBarItem) {
        statusBarItem.dispose();
    }

    console.log('✅ Kiro-Chan BongoCat-style extension deactivated');
}