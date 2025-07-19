import { AnimationController } from '../src/animation/AnimationController';
import { AnimationPattern } from '../src/types';

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
const animationFrameCallbacks: Array<() => void> = [];

global.requestAnimationFrame = jest.fn((callback: () => void) => {
  const id = ++animationFrameId;
  animationFrameCallbacks[id] = callback;
  return id;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  delete animationFrameCallbacks[id];
});

// Mock performance.now
global.performance = {
  now: jest.fn(() => Date.now())
} as any;

describe('AnimationController', () => {
  let controller: AnimationController;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create mock DOM element
    mockElement = {
      style: {
        transform: ''
      }
    } as HTMLElement;

    controller = new AnimationController(mockElement);
    
    // Reset mocks
    jest.clearAllMocks();
    animationFrameCallbacks.length = 0;
    animationFrameId = 0;
  });

  afterEach(() => {
    controller.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(controller.getCurrentPattern()).toBe(AnimationPattern.IDLE);
      expect(controller.getAnimationSpeed()).toBe(1.0);
      expect(controller.isAnimating()).toBe(false);
    });

    test('should accept element in constructor', () => {
      const newController = new AnimationController(mockElement);
      expect(newController).toBeDefined();
      newController.dispose();
    });

    test('should allow setting element after construction', () => {
      const newController = new AnimationController();
      newController.setElement(mockElement);
      expect(() => newController.startAnimation(AnimationPattern.IDLE)).not.toThrow();
      newController.dispose();
    });
  });

  describe('Animation Control', () => {
    test('should start animation with specified pattern', () => {
      controller.startAnimation(AnimationPattern.ACTIVE);
      
      expect(controller.getCurrentPattern()).toBe(AnimationPattern.ACTIVE);
      expect(controller.isAnimating()).toBe(true);
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    test('should stop animation', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      expect(controller.isAnimating()).toBe(true);
      
      controller.stopAnimation();
      expect(controller.isAnimating()).toBe(false);
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    test('should not restart same animation pattern', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      const firstCallCount = (requestAnimationFrame as jest.Mock).mock.calls.length;
      
      controller.startAnimation(AnimationPattern.IDLE);
      const secondCallCount = (requestAnimationFrame as jest.Mock).mock.calls.length;
      
      expect(secondCallCount).toBe(firstCallCount);
    });

    test('should switch animation patterns', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      expect(controller.getCurrentPattern()).toBe(AnimationPattern.IDLE);
      
      controller.startAnimation(AnimationPattern.ACTIVE);
      expect(controller.getCurrentPattern()).toBe(AnimationPattern.ACTIVE);
    });
  });

  describe('Animation Speed', () => {
    test('should set and get animation speed', () => {
      controller.setAnimationSpeed(2.0);
      expect(controller.getAnimationSpeed()).toBe(2.0);
    });

    test('should throw error for invalid speed values', () => {
      expect(() => controller.setAnimationSpeed(0.05)).toThrow();
      expect(() => controller.setAnimationSpeed(4.0)).toThrow();
    });

    test('should accept valid speed range', () => {
      expect(() => controller.setAnimationSpeed(0.1)).not.toThrow();
      expect(() => controller.setAnimationSpeed(3.0)).not.toThrow();
    });
  });

  describe('Animation Patterns', () => {
    beforeEach(() => {
      // Mock performance.now to return predictable values
      let time = 0;
      (performance.now as jest.Mock).mockImplementation(() => time += 16); // 60fps
    });

    test('should apply idle animation transform', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      
      // Trigger animation frame
      const callback = animationFrameCallbacks[1];
      if (callback) callback();
      
      expect(mockElement.style.transform).toContain('translateY');
      expect(mockElement.style.transform).toContain('rotate');
    });

    test('should apply active animation transform', () => {
      controller.startAnimation(AnimationPattern.ACTIVE);
      
      // Trigger animation frame
      const callback = animationFrameCallbacks[1];
      if (callback) callback();
      
      expect(mockElement.style.transform).toContain('translateY');
      expect(mockElement.style.transform).toContain('scale');
    });

    test('should apply error animation transform', () => {
      controller.startAnimation(AnimationPattern.ERROR);
      
      // Trigger animation frame
      const callback = animationFrameCallbacks[1];
      if (callback) callback();
      
      expect(mockElement.style.transform).toContain('translateX');
      expect(mockElement.style.transform).toContain('translateY');
    });
  });

  describe('Element Handling', () => {
    test('should handle missing element gracefully', () => {
      const controllerWithoutElement = new AnimationController();
      
      expect(() => controllerWithoutElement.startAnimation(AnimationPattern.IDLE)).not.toThrow();
      expect(controllerWithoutElement.isAnimating()).toBe(false);
      
      controllerWithoutElement.dispose();
    });

    test('should not update transform without element', () => {
      const controllerWithoutElement = new AnimationController();
      controllerWithoutElement.startAnimation(AnimationPattern.IDLE);
      
      // Should not throw error
      expect(() => {
        const callback = animationFrameCallbacks[1];
        if (callback) callback();
      }).not.toThrow();
      
      controllerWithoutElement.dispose();
    });
  });

  describe('Disposal', () => {
    test('should stop animation on dispose', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      expect(controller.isAnimating()).toBe(true);
      
      controller.dispose();
      expect(controller.isAnimating()).toBe(false);
    });

    test('should clear element reference on dispose', () => {
      controller.dispose();
      
      // Starting animation after dispose should not throw but should not animate
      expect(() => controller.startAnimation(AnimationPattern.IDLE)).not.toThrow();
      expect(controller.isAnimating()).toBe(false);
    });
  });

  describe('Performance Considerations', () => {
    test('should use requestAnimationFrame for smooth animation', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    test('should cancel animation frame on stop', () => {
      controller.startAnimation(AnimationPattern.IDLE);
      const frameId = (requestAnimationFrame as jest.Mock).mock.results[0].value;
      
      controller.stopAnimation();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(frameId);
    });
  });
});
