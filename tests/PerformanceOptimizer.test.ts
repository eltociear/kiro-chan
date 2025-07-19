import { PerformanceOptimizer } from '../src/performance/PerformanceOptimizer';

// Mock window and performance APIs
const mockWindow = {
  setInterval: jest.fn(),
  clearInterval: jest.fn(),
  PerformanceObserver: jest.fn()
};

const mockPerformance = {
  memory: {
    usedJSHeapSize: 100 * 1024 * 1024 // 100MB in bytes
  },
  mark: jest.fn(),
  measure: jest.fn()
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    jest.clearAllMocks();
    optimizer = new PerformanceOptimizer();
  });

  afterEach(() => {
    optimizer.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(optimizer.getCurrentFrameRate()).toBe(60);
      expect(optimizer.getCpuThreshold()).toBe(80);
      expect(optimizer.getMemoryThreshold()).toBe(500);
      expect(optimizer.getFrameRateRange()).toEqual({ min: 15, max: 60 });
    });
  });

  describe('Performance Monitoring', () => {
    test('should start monitoring', () => {
      optimizer.monitorPerformance();
      expect(mockWindow.setInterval).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    test('should not start monitoring twice', () => {
      optimizer.monitorPerformance();
      optimizer.monitorPerformance();
      expect(mockWindow.setInterval).toHaveBeenCalledTimes(1);
    });

    test('should stop monitoring', () => {
      optimizer.monitorPerformance();
      optimizer.stopMonitoring();
      expect(mockWindow.clearInterval).toHaveBeenCalled();
    });
  });

  describe('Performance Assessment', () => {
    test('should not reduce animation under normal conditions', () => {
      expect(optimizer.shouldReduceAnimation()).toBe(false);
    });

    test('should reduce animation when memory usage is high', () => {
      optimizer.setMemoryThreshold(50); // Set low threshold
      expect(optimizer.shouldReduceAnimation()).toBe(true);
    });

    test('should return optimal frame rate', () => {
      const frameRate = optimizer.getOptimalFrameRate();
      expect(frameRate).toBeGreaterThan(0);
      expect(frameRate).toBeLessThanOrEqual(60);
    });

    test('should reduce frame rate when performance is poor', () => {
      optimizer.setMemoryThreshold(50); // Force poor performance
      const reducedFrameRate = optimizer.getOptimalFrameRate();
      expect(reducedFrameRate).toBeLessThan(60);
    });
  });

  describe('Performance Adjustment', () => {
    test('should adjust performance based on conditions', () => {
      const initialFrameRate = optimizer.getCurrentFrameRate();
      
      optimizer.setMemoryThreshold(50); // Force adjustment
      optimizer.adjustPerformance();
      
      expect(optimizer.getCurrentFrameRate()).toBeLessThan(initialFrameRate);
    });

    test('should not reduce frame rate below minimum', () => {
      optimizer.setFrameRateRange(30, 60);
      optimizer.setMemoryThreshold(10); // Force maximum reduction
      
      for (let i = 0; i < 10; i++) {
        optimizer.adjustPerformance();
      }
      
      expect(optimizer.getCurrentFrameRate()).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Configuration', () => {
    test('should set CPU threshold', () => {
      optimizer.setCpuThreshold(90);
      expect(optimizer.getCpuThreshold()).toBe(90);
    });

    test('should throw error for invalid CPU threshold', () => {
      expect(() => optimizer.setCpuThreshold(5)).toThrow();
      expect(() => optimizer.setCpuThreshold(150)).toThrow();
    });

    test('should set memory threshold', () => {
      optimizer.setMemoryThreshold(1000);
      expect(optimizer.getMemoryThreshold()).toBe(1000);
    });

    test('should throw error for invalid memory threshold', () => {
      expect(() => optimizer.setMemoryThreshold(10)).toThrow();
      expect(() => optimizer.setMemoryThreshold(3000)).toThrow();
    });

    test('should set frame rate range', () => {
      optimizer.setFrameRateRange(20, 120);
      expect(optimizer.getFrameRateRange()).toEqual({ min: 20, max: 120 });
    });

    test('should throw error for invalid frame rate range', () => {
      expect(() => optimizer.setFrameRateRange(0, 60)).toThrow();
      expect(() => optimizer.setFrameRateRange(30, 20)).toThrow();
      expect(() => optimizer.setFrameRateRange(10, 200)).toThrow();
    });
  });

  describe('Performance History', () => {
    test('should maintain performance history', () => {
      optimizer.monitorPerformance();
      
      // Simulate interval callback
      const intervalCallback = (mockWindow.setInterval as jest.Mock).mock.calls[0][0];
      intervalCallback();
      
      const history = optimizer.getPerformanceHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('frameRate');
      expect(history[0]).toHaveProperty('memoryUsage');
    });

    test('should limit history size', () => {
      optimizer.monitorPerformance();
      const intervalCallback = (mockWindow.setInterval as jest.Mock).mock.calls[0][0];
      
      // Simulate many intervals
      for (let i = 0; i < 15; i++) {
        intervalCallback();
      }
      
      const history = optimizer.getPerformanceHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Memory Usage Detection', () => {
    test('should detect memory usage from performance.memory', () => {
      const shouldReduce = optimizer.shouldReduceAnimation();
      // With 100MB usage and 500MB threshold, should not reduce
      expect(shouldReduce).toBe(false);
    });

    test('should handle missing performance.memory gracefully', () => {
      const originalMemory = mockPerformance.memory;
      delete (mockPerformance as any).memory;
      
      expect(() => optimizer.shouldReduceAnimation()).not.toThrow();
      
      mockPerformance.memory = originalMemory;
    });
  });

  describe('Disposal', () => {
    test('should stop monitoring on dispose', () => {
      optimizer.monitorPerformance();
      optimizer.dispose();
      expect(mockWindow.clearInterval).toHaveBeenCalled();
    });

    test('should clear performance history on dispose', () => {
      optimizer.monitorPerformance();
      const intervalCallback = (mockWindow.setInterval as jest.Mock).mock.calls[0][0];
      intervalCallback();
      
      expect(optimizer.getPerformanceHistory().length).toBeGreaterThan(0);
      
      optimizer.dispose();
      expect(optimizer.getPerformanceHistory().length).toBe(0);
    });
  });
});
