// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { CozeloopSpanExporterOptionsSchema } from '@cozeloop/langchain/otel';

describe('CozeloopSpanExporterOptionsSchema', () => {
  describe('workspaceId', () => {
    test('should accept valid workspaceId', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.workspaceId).toBe('workspace-123');
    });

    test('should fail when workspaceId is empty', () => {
      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: '',
          token: 'pat_xxx',
        }),
      ).toThrow(
        'workspaceId not provided, neither pass it or set it via process.env.COZELOOP_WORKSPACE_ID',
      );
    });

    // Note: Testing "env not set" case is not possible here because
    // schema's prefault values are evaluated at module load time
  });

  describe('token', () => {
    test('should accept valid token', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.token).toBe('pat_xxx');
    });

    test('should fail when token is empty', () => {
      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: 'workspace-123',
          token: '',
        }),
      ).toThrow(
        'token not provided, neither pass it or set it via process.env.COZELOOP_API_TOKEN',
      );
    });

    // Note: Testing "env not set" case is not possible here because
    // schema's prefault values are evaluated at module load time
  });

  describe('traceEndpoint', () => {
    test('should use default endpoint when not provided', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.traceEndpoint).toBe(
        'https://api.coze.cn/v1/loop/opentelemetry/v1/traces',
      );
    });

    test('should accept custom endpoint', () => {
      const customEndpoint = 'https://custom.endpoint.com/traces';
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
        traceEndpoint: customEndpoint,
      });
      expect(result.traceEndpoint).toBe(customEndpoint);
    });
  });

  describe('headers', () => {
    test('should use empty object as default', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.headers).toEqual({});
    });

    test('should accept custom headers', () => {
      const headers = { 'X-Custom-Header': 'value' };
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
        headers,
      });
      expect(result.headers).toEqual(headers);
    });
  });

  describe('batchSize', () => {
    test('should use default batch size of 100', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.batchSize).toBe(100);
    });

    test('should accept custom batch size', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
        batchSize: 50,
      });
      expect(result.batchSize).toBe(50);
    });

    test('should fail when batch size is 0 or negative', () => {
      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: 'workspace-123',
          token: 'pat_xxx',
          batchSize: 0,
        }),
      ).toThrow();

      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: 'workspace-123',
          token: 'pat_xxx',
          batchSize: -1,
        }),
      ).toThrow();
    });
  });

  describe('scheduleDelay', () => {
    test('should use default schedule delay of 1000ms', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
      });
      expect(result.scheduleDelay).toBe(1000);
    });

    test('should accept custom schedule delay', () => {
      const result = CozeloopSpanExporterOptionsSchema.parse({
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
        scheduleDelay: 500,
      });
      expect(result.scheduleDelay).toBe(500);
    });

    test('should fail when schedule delay is 0 or negative', () => {
      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: 'workspace-123',
          token: 'pat_xxx',
          scheduleDelay: 0,
        }),
      ).toThrow();

      expect(() =>
        CozeloopSpanExporterOptionsSchema.parse({
          workspaceId: 'workspace-123',
          token: 'pat_xxx',
          scheduleDelay: -1,
        }),
      ).toThrow();
    });
  });

  describe('full schema validation', () => {
    test('should parse complete valid options', () => {
      const options = {
        workspaceId: 'workspace-123',
        token: 'pat_xxx',
        traceEndpoint: 'https://custom.endpoint.com/traces',
        headers: { 'X-Custom': 'value' },
        batchSize: 200,
        scheduleDelay: 2000,
      };

      const result = CozeloopSpanExporterOptionsSchema.parse(options);

      expect(result).toEqual(options);
    });
  });
});
