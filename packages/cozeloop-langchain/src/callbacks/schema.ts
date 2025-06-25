import { z } from 'zod';

function formatPropertyUnprovidedError(propName: string, envKey: string) {
  return `${propName} not provided, neither pass it or set it via process.env.${envKey}`;
}

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SCHEDULE_DELAY = 30_000;

export const CozeloopSpanProcessorOptionsSchema = z.object({
  /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  workspaceId: z
    .string()
    .default(process.env.COZELOOP_WORKSPACE_ID || '')
    .refine(val => Boolean(val), {
      message: formatPropertyUnprovidedError(
        'workspaceId',
        'COZELOOP_WORKSPACE_ID',
      ),
    }),
  /** Endpoint to export traces, use process.env.OTEL_EXPORTER_OTLP_ENDPOINT when unprovided */
  traceEndpoint: z
    .string()
    .default(process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '')
    .refine(val => Boolean(val), {
      message: formatPropertyUnprovidedError(
        'traceEndpoint',
        'OTEL_EXPORTER_OTLP_ENDPOINT',
      ),
    }),
  /** CozeLoop API token, use process.env.COZELOOP_API_TOKEN when unprovided */
  token: z
    .string()
    .default(process.env.COZELOOP_API_TOKEN || '')
    .refine(val => Boolean(val), {
      message: formatPropertyUnprovidedError('token', 'COZELOOP_API_TOKEN'),
    }),
  /** Export passthrough headers */
  headers: z.record(z.string(), z.string()).default({}),
  /** Export batch size, default to `100` */
  batchSize: z.number().gt(0).default(DEFAULT_BATCH_SIZE),
  /** Export batch report delay, default to `20`ms */
  scheduleDelay: z.number().gt(0).default(DEFAULT_SCHEDULE_DELAY),
});

export type CozeloopSpanProcessorOptions = z.infer<
  typeof CozeloopSpanProcessorOptionsSchema
>;
