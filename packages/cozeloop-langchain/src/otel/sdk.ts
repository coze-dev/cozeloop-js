// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { NodeSDK } from '@opentelemetry/sdk-node';

import { type CozeloopSpanExporterOptions } from './schema';
import { CozeloopSpanProcessor } from './cozeloop-processor';

export const OTelNodeSDK = (() => {
  const cozeloopProcessor = new CozeloopSpanProcessor();
  // let started = false;
  const sdk = new NodeSDK({
    spanProcessors: [cozeloopProcessor],
  });
  sdk.start();

  return {
    addExporter: (name: string, options: CozeloopSpanExporterOptions = {}) => {
      cozeloopProcessor.addExporter(name, options);
    },
    removeExporter: async (name: string) => {
      await cozeloopProcessor.removeExporter(name);
    },
    flushExporter: async (name: string) => {
      await cozeloopProcessor.flushExporter(name);
    },
    forceFlush: async () => {
      await cozeloopProcessor.forceFlush();
    },
    shutdown: async () => {
      await cozeloopProcessor.shutdown();
      await sdk.shutdown();
    },
  };
})();
