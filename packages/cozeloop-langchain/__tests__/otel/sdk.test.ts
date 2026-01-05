// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { test, describe, expect, vi } from 'vitest';
import { NodeSDK } from '@opentelemetry/sdk-node';

import {
  type CozeloopSpanExporterOptions,
  CozeloopSpanProcessor,
  OTelNodeSDK,
} from '@cozeloop/langchain/otel';

describe('OTelNodeSDK', () => {
  test('addExporter should call cozeloopProcessor.addExporter', () => {
    const addExporterMock = vi.spyOn(
      CozeloopSpanProcessor.prototype,
      'addExporter',
    );
    const name = 'test-exporter';
    const options: CozeloopSpanExporterOptions = {
      workspaceId: '10086',
      token: 'pat_xxx',
    };

    OTelNodeSDK.addExporter(name, options);

    expect(addExporterMock).toHaveBeenCalledWith(name, options);
  });

  // 添加其他测试用例
  test('removeExporter should call cozeloopProcessor.removeExporter', async () => {
    const removeExporterMock = vi.spyOn(
      CozeloopSpanProcessor.prototype,
      'removeExporter',
    );
    const name = 'test-exporter';

    await OTelNodeSDK.removeExporter(name);

    expect(removeExporterMock).toHaveBeenCalledWith(name);
  });

  test('flushExporter should call cozeloopProcessor.flushExporter', async () => {
    const flushExporterMock = vi.spyOn(
      CozeloopSpanProcessor.prototype,
      'flushExporter',
    );
    const name = 'test-exporter';

    await OTelNodeSDK.flushExporter(name);

    expect(flushExporterMock).toHaveBeenCalledWith(name);
  });

  test('forceFlush should call cozeloopProcessor.forceFlush', async () => {
    const forceFlushMock = vi.spyOn(
      CozeloopSpanProcessor.prototype,
      'forceFlush',
    );

    await OTelNodeSDK.forceFlush();

    expect(forceFlushMock).toHaveBeenCalled();
  });

  test('shutdown should call cozeloopProcessor.shutdown and sdk.shutdown', async () => {
    const cozeloopShutdownMock = vi.spyOn(
      CozeloopSpanProcessor.prototype,
      'shutdown',
    );
    const sdkShutdownMock = vi.spyOn(NodeSDK.prototype, 'shutdown');

    await OTelNodeSDK.shutdown();

    expect(cozeloopShutdownMock).toHaveBeenCalled();
    expect(sdkShutdownMock).toHaveBeenCalled();
  });
});
