import { StateAnimationBridge } from '../src/state/StateAnimationBridge';
import { StateMonitor } from '../src/state/StateMonitor';
import { AnimationController } from '../src/animation/AnimationController';
import { KiroState, AnimationPattern } from '../src/types';

// Mock the dependencies
jest.mock('../src/state/StateMonitor');
jest.mock('../src/animation/AnimationController');

describe('StateAnimationBridge', () => {
  let bridge: StateAnimationBridge;
  let mockStateMonitor: jest.Mocked<StateMonitor>;
  let mockAnimationController: jest.Mocked<AnimationController>;
  let stateChangeCallback: (state: KiroState) => void;

  beforeEach(() => {
    mockStateMonitor = new StateMonitor() as jest.Mocked<StateMonitor>;
    mockAnimationController = new AnimationController() as jest.Mocked<AnimationController>;

    // Capture the state change callback
    mockStateMonitor.onStateChange.mockImplementation((callback) => {
      stateChangeCallback = callback;
    });

    bridge = new StateAnimationBridge(mockStateMonitor, mockAnimationController);
  });

  afterEach(() => {
    bridge.dispose();
  });

  describe('Initialization', () => {
    test('should bind to state monitor on construction', () => {
      expect(mockStateMonitor.onStateChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('State to Animation Mapping', () => {
    test('should map IDLE state to IDLE animation', (done) => {
      stateChangeCallback(KiroState.IDLE);
      
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.IDLE);
        done();
      }, 350); // Wait for transition delay
    });

    test('should map EXECUTING state to ACTIVE animation', (done) => {
      stateChangeCallback(KiroState.EXECUTING);
      
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ACTIVE);
        done();
      }, 350);
    });

    test('should map ERROR state to ERROR animation', (done) => {
      stateChangeCallback(KiroState.ERROR);
      
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ERROR);
        done();
      }, 350);
    });
  });

  describe('Transition Delay', () => {
    test('should have default transition delay', () => {
      expect(bridge.getTransitionDelay()).toBe(300);
    });

    test('should set transition delay', () => {
      bridge.setTransitionDelay(500);
      expect(bridge.getTransitionDelay()).toBe(500);
    });

    test('should throw error for invalid transition delay', () => {
      expect(() => bridge.setTransitionDelay(-100)).toThrow();
      expect(() => bridge.setTransitionDelay(3000)).toThrow();
    });

    test('should accept valid transition delay range', () => {
      expect(() => bridge.setTransitionDelay(0)).not.toThrow();
      expect(() => bridge.setTransitionDelay(2000)).not.toThrow();
    });

    test('should delay animation start by transition delay', (done) => {
      bridge.setTransitionDelay(100);
      
      stateChangeCallback(KiroState.EXECUTING);
      
      // Should not be called immediately
      expect(mockAnimationController.startAnimation).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ACTIVE);
        done();
      }, 150);
    });
  });

  describe('Immediate Transitions', () => {
    test('should force immediate transition without delay', () => {
      bridge.forceImmediateTransition(KiroState.ERROR);
      
      expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ERROR);
    });

    test('should cancel pending transition when forcing immediate', (done) => {
      // Start a delayed transition
      stateChangeCallback(KiroState.EXECUTING);
      
      // Immediately force a different transition
      bridge.forceImmediateTransition(KiroState.ERROR);
      
      expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ERROR);
      
      // Wait for the original delay and ensure it doesn't trigger
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledTimes(1);
        done();
      }, 350);
    });
  });

  describe('Multiple State Changes', () => {
    test('should cancel previous transition when new state change occurs', (done) => {
      // First state change
      stateChangeCallback(KiroState.EXECUTING);
      
      // Second state change before first completes
      setTimeout(() => {
        stateChangeCallback(KiroState.ERROR);
      }, 100);
      
      // Wait for both delays to complete
      setTimeout(() => {
        // Should only have been called once with the latest state
        expect(mockAnimationController.startAnimation).toHaveBeenCalledTimes(1);
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.ERROR);
        done();
      }, 450);
    });
  });

  describe('Disposal', () => {
    test('should cancel pending transitions on dispose', () => {
      stateChangeCallback(KiroState.EXECUTING);
      
      bridge.dispose();
      
      // Wait for original delay
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).not.toHaveBeenCalled();
      }, 350);
    });
  });

  describe('Edge Cases', () => {
    test('should handle unknown state gracefully', (done) => {
      // Cast to bypass TypeScript checking for testing
      stateChangeCallback('unknown' as KiroState);
      
      setTimeout(() => {
        expect(mockAnimationController.startAnimation).toHaveBeenCalledWith(AnimationPattern.IDLE);
        done();
      }, 350);
    });
  });
});
