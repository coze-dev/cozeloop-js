// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type, type Type } from 'arktype';

function formatPropertyUnprovidedError(propName: string, envKey: string) {
  return `${propName} not provided, neither pass it or set it via process.env.${envKey}`;
}

function withParse<T extends Type>(schema: T) {
  return Object.assign(schema, {
    parse: (data: unknown): T['infer'] => {
      const result = schema(data);
      if (result instanceof type.errors) {
        throw new Error(result.summary);
      }
      return result as T['infer'];
    },
  });
}

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SCHEDULE_DELAY = 1_000;
const DEFAULT_TRACE_ENDPOINT =
  'https://api.coze.cn/v1/loop/opentelemetry/v1/traces';

export const CozeloopSpanExporterOptionsSchema = withParse(
  type({
    /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
    workspaceId: type('string').default(
      process.env.COZELOOP_WORKSPACE_ID || '',
    ),
    /**
     * Endpoint to export traces, use process.env.COZELOOP_OTLP_ENDPOINT when unprovided
     * @default 'https://api.coze.cn/v1/loop/opentelemetry/v1/traces'
     */
    traceEndpoint: type('string').default(
      process.env.COZELOOP_OTLP_ENDPOINT || DEFAULT_TRACE_ENDPOINT,
    ),
    /** CozeLoop API token, use process.env.COZELOOP_API_TOKEN when unprovided */
    token: type('string').default(process.env.COZELOOP_API_TOKEN || ''),
    /** Export passthrough headers */
    headers: type('Record<string, string>').default(() => ({})),
    /** Export batch size, default to `100` */
    batchSize: type('number > 0').default(DEFAULT_BATCH_SIZE),
    /** Export batch report delay, default to `20`ms */
    scheduleDelay: type('number > 0').default(DEFAULT_SCHEDULE_DELAY),
  }).narrow((val, ctx) => {
    if (!val.workspaceId) {
      return ctx.reject({
        message: formatPropertyUnprovidedError(
          'workspaceId',
          'COZELOOP_WORKSPACE_ID',
        ),
      });
    }
    if (!val.token) {
      return ctx.reject({
        message: formatPropertyUnprovidedError('token', 'COZELOOP_API_TOKEN'),
      });
    }
    return true;
  }),
);

export type CozeloopSpanExporterOptions = Partial<
  typeof CozeloopSpanExporterOptionsSchema.infer
>;
