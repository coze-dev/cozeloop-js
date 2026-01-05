// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  ensureProperty,
  EnvKeys,
  getEnvVar,
  isBrowser,
} from '../../src/utils/env';
import { PropertyUnprovidedError } from '../../src/error';

describe('Test utils/env.ts', () => {
  describe('🧪 isBrowser', () => {
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      globalThis.window = originalWindow;
    });

    it('should return true when window is defined', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- skip
      globalThis.window = {} as Window & typeof globalThis;
      expect(isBrowser()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      // @ts-expect-error: Setting window to undefined
      globalThis.window = undefined;
      expect(isBrowser()).toBe(false);
    });

    it('should return false when window is null', () => {
      // @ts-expect-error: Setting window to null
      globalThis.window = null;
      expect(isBrowser()).toBe(false);
    });
  });

  describe('🧪 getEnvVar', () => {
    const originalEnv = process.env;
    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('should return default value when process is undefined', () => {
      const originalProcess = global.process;
      // @ts-expect-error: Simulating process as undefined
      global.process = undefined;
      expect(getEnvVar(EnvKeys.API_BASE_URL, 'default')).toBe('default');
      global.process = originalProcess;
    });

    it('should return environment variable when it exists', () => {
      process.env.COZELOOP_API_BASE_URL = 'https://api.example.com';
      expect(getEnvVar(EnvKeys.API_BASE_URL)).toBe('https://api.example.com');
    });

    it('should return provided value weather environment variable exists', () => {
      process.env.COZELOOP_API_BASE_URL = 'https://api.example.com';
      expect(getEnvVar(EnvKeys.WORKSPACE_ID, 'default')).toBe('default');
      expect(getEnvVar(EnvKeys.API_BASE_URL, 'default')).toBe('default');
    });

    it('should return undefined when environment variable does not exist and no default is provided', () => {
      expect(getEnvVar(EnvKeys.API_BASE_URL)).toBeUndefined();
    });

    it('should work with different EnvKeys', () => {
      process.env.COZELOOP_WORKSPACE_ID = 'workspace123';
      process.env.COZELOOP_API_TOKEN = 'token123';
      expect(getEnvVar(EnvKeys.WORKSPACE_ID)).toBe('workspace123');
      expect(getEnvVar(EnvKeys.API_TOKEN)).toBe('token123');
    });
  });

  describe('🧪 ensureProperty', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return the value when provided as an argument', () => {
      const result = ensureProperty({
        propName: 'testProp',
        envKey: EnvKeys.API_BASE_URL,
        value: 'https://example.com',
      });
      expect(result).toBe('https://example.com');
    });

    it('should return the value from environment variable when not provided as an argument', () => {
      process.env.COZELOOP_API_BASE_URL = 'https://env-example.com';
      const result = ensureProperty({
        propName: 'testProp',
        envKey: EnvKeys.API_BASE_URL,
      });
      expect(result).toBe('https://env-example.com');
    });

    it('should throw PropertyUnprovidedError when value is not provided and not in env', () => {
      expect(() =>
        ensureProperty({
          propName: 'testProp',
          envKey: EnvKeys.API_BASE_URL,
        }),
      ).toThrow(PropertyUnprovidedError);
    });

    it('should include tag in the error when provided', () => {
      try {
        ensureProperty({
          propName: 'testProp',
          envKey: EnvKeys.API_BASE_URL,
          tag: 'TestTag',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(PropertyUnprovidedError);
        expect((error as PropertyUnprovidedError).tag).toBe('TestTag');
      }
    });

    it('should prioritize provided value over environment variable', () => {
      process.env.COZELOOP_API_BASE_URL = 'https://env-example.com';
      const result = ensureProperty({
        propName: 'testProp',
        envKey: EnvKeys.API_BASE_URL,
        value: 'https://provided-example.com',
      });
      expect(result).toBe('https://provided-example.com');
    });
  });
});
