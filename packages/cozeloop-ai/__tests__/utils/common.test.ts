// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-empty-function -- skip for test */
import {
  compareVersions,
  mergeConfig,
  safeNumber,
  stringifyVal,
} from '../../src/utils/common';

describe('Test utils/common.ts', () => {
  describe('🧪 compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.3.4', '2.3.4')).toBe(0);
    });

    it('should return 1 when first version is greater', () => {
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareVersions('1.10.0', '1.9.0')).toBe(1);
    });

    it('should return -1 when second version is greater', () => {
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
      expect(compareVersions('1.9.0', '1.10.0')).toBe(-1);
    });

    it('should handle versions with different number of parts', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.0.0', '1.0')).toBe(0);
      expect(compareVersions('1.0', '1.0.1')).toBe(-1);
      expect(compareVersions('1.1', '1.0.9')).toBe(1);
    });

    it('should handle large version numbers', () => {
      expect(compareVersions('10.0.0', '9.9.9')).toBe(1);
      expect(compareVersions('9.9.9', '10.0.0')).toBe(-1);
    });

    it('should handle version numbers with leading zeros', () => {
      expect(compareVersions('1.02.0', '1.2.0')).toBe(0);
      expect(compareVersions('1.02.0', '1.3.0')).toBe(-1);
    });
  });

  describe('🧪 mergeConfig', () => {
    it('should merge simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      expect(mergeConfig(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should handle undefined inputs', () => {
      const obj1 = { a: 1 };
      expect(mergeConfig(obj1, undefined)).toEqual({ a: 1 });
      expect(mergeConfig(undefined, obj1)).toEqual({ a: 1 });
      expect(mergeConfig(undefined, undefined)).toEqual({});
    });

    it('should deeply merge nested objects', () => {
      const obj1 = { a: { x: 1, y: 2 }, b: 3 };
      const obj2 = { a: { y: 3, z: 4 }, c: 5 };
      expect(mergeConfig(obj1, obj2)).toEqual({
        a: { x: 1, y: 3, z: 4 },
        b: 3,
        c: 5,
      });
    });

    it('should overwrite arrays instead of merging them', () => {
      const obj1 = { a: [1, 2], b: 2 };
      const obj2 = { a: [3, 4], c: 3 };
      expect(mergeConfig(obj1, obj2)).toEqual({ a: [3, 4], b: 2, c: 3 });
    });

    it('should merge multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      expect(mergeConfig(obj1, obj2, obj3)).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should handle empty objects', () => {
      const obj1 = { a: 1 };
      const obj2 = {};
      expect(mergeConfig(obj1, obj2)).toEqual({ a: 1 });
      expect(mergeConfig(obj2, obj1)).toEqual({ a: 1 });
    });

    it('should preserve object references for non-plain objects', () => {
      const date = new Date();
      const obj1 = { a: date };
      const obj2 = { b: 2 };
      const result = mergeConfig(obj1, obj2);
      expect(result.a).toBe(date);
    });

    it('should merge objects with different depths', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { d: 2 } }, e: 3 };
      expect(mergeConfig(obj1, obj2)).toEqual({
        a: { b: { c: 1, d: 2 } },
        e: 3,
      });
    });
  });

  describe('🧪 stringifyVal', () => {
    it('should handle number values', () => {
      expect(stringifyVal(42)).toBe('42');
      expect(stringifyVal(-3.14)).toBe('-3.14');
      expect(stringifyVal(0)).toBe('0');
    });

    it('should handle bigint values', () => {
      expect(stringifyVal(BigInt(9007199254740991))).toBe('9007199254740991');
    });

    it('should handle boolean values', () => {
      expect(stringifyVal(true)).toBe('true');
      expect(stringifyVal(false)).toBe('false');
    });

    it('should handle string values', () => {
      expect(stringifyVal('hello')).toBe('hello');
      expect(stringifyVal('')).toBe('');
    });

    it('should handle symbol values', () => {
      const sym = Symbol('test');
      expect(stringifyVal(sym)).toBe('Symbol(test)');
    });

    it('should handle object values', () => {
      expect(stringifyVal({ a: 1, b: 'test' })).toBe('{"a":1,"b":"test"}');
      expect(stringifyVal([])).toBe('[]');
      expect(stringifyVal([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should handle null value', () => {
      expect(stringifyVal(null)).toBe('');
    });

    it('should handle undefined value', () => {
      expect(stringifyVal(undefined)).toBe('');
    });

    it('should handle function values', () => {
      function testFunc() {}
      expect(stringifyVal(testFunc)).toBe('function@testFunc');
      expect(stringifyVal(() => {})).toBe('function@');
    });

    it('should handle Date object', () => {
      const date = new Date('2023-05-20T12:00:00Z');
      expect(stringifyVal(date)).toBe(JSON.stringify(date));
    });

    it('should handle custom objects', () => {
      class TestClass {
        prop = 'value';
      }
      const instance = new TestClass();
      expect(stringifyVal(instance)).toBe('{"prop":"value"}');
    });
  });

  describe('🧪 safeNumber', () => {
    it('should return the same number for number inputs', () => {
      expect(safeNumber(42)).toBe(42);
      expect(safeNumber(0)).toBe(0);
      expect(safeNumber(-123)).toBe(-123);
      expect(safeNumber(3.14)).toBe(3.14);
    });
    it('should convert valid number strings to numbers', () => {
      expect(safeNumber('42')).toBe(42);
      expect(safeNumber('0')).toBe(0);
      expect(safeNumber('-123')).toBe(-123);
      expect(safeNumber('3.14')).toBe(3.14);
    });
    it('should handle scientific notation', () => {
      expect(safeNumber('1e3')).toBe(1000);
      expect(safeNumber('-1.23e-2')).toBe(-0.0123);
    });
    it('should handle whitespace', () => {
      expect(safeNumber('  42  ')).toBe(42);
      expect(safeNumber('\n3.14\t')).toBe(3.14);
    });
    it('should return undefined for invalid inputs', () => {
      expect(safeNumber(undefined)).toBeUndefined();
      expect(safeNumber('abc')).toBeUndefined();
      expect(safeNumber('123abc')).toBeUndefined();
      expect(safeNumber('')).toBeUndefined();
      expect(safeNumber('  ')).toBeUndefined();
      expect(safeNumber('Infinity')).toBeUndefined();
      expect(safeNumber('-Infinity')).toBeUndefined();
      expect(safeNumber('NaN')).toBeUndefined();
    });
    it('should handle edge cases', () => {
      expect(safeNumber(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
      expect(safeNumber(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
      expect(safeNumber('1e-324')).toBe(0);
      expect(safeNumber('1.7976931348623157e+308')).toBe(Number.MAX_VALUE);
    });
    it('should return undefined for NaN and Infinity', () => {
      expect(safeNumber(NaN)).toBeUndefined();
      expect(safeNumber(Infinity)).toBe(Infinity);
      expect(safeNumber(-Infinity)).toBe(-Infinity);
    });
  });
});
