// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { createLoopLogger, LoopLoggable } from '../../src/utils/logger';

describe('Test utils/logger.ts', () => {
  describe('🧪 createLoopLogger', () => {
    it('should create a LoopLogger with all expected methods', () => {
      const logger = createLoopLogger();

      expect(typeof logger).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('🧪 LoopLoggable', () => {
    class TestLoopLoggable extends LoopLoggable {
      public getLoopLogger() {
        return this.loopLogger;
      }
    }

    it('should initialize with provided logger and tag', () => {
      const mockLogger = vi.fn();
      const tag = 'TestTag';

      const loggable = new TestLoopLoggable(mockLogger, tag);
      loggable.getLoopLogger()('Test message');

      expect(mockLogger).toHaveBeenCalled();
    });
  });
});
