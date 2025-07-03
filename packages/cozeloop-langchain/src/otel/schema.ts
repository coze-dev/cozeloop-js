import { z } from 'zod/v4';

function formatPropertyUnprovidedError(propName: string, envKey: string) {
  return `${propName} not provided, neither pass it or set it via process.env.${envKey}`;
}

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SCHEDULE_DELAY = 30_000;
const DEFAULT_TRACE_ENDPOINT =
  'https://api.coze.cn/v1/loop/opentelemetry/v1/traces';

export const CozeloopSpanExporterOptionsSchema = z.object({
  /** Workspace ID, use process.env.COZELOOP_WORKSPACE_ID when unprovided */
  workspaceId: z
    .string()
    .prefault(process.env.COZELOOP_WORKSPACE_ID || '')
    .refine(val => Boolean(val), {
      message: formatPropertyUnprovidedError(
        'workspaceId',
        'COZELOOP_WORKSPACE_ID',
      ),
    }),
  /**
   * Endpoint to export traces, use process.env.COZELOOP_OTLP_ENDPOINT when unprovided
   * @default 'https://api.coze.cn/v1/loop/opentelemetry/v1/traces'
   */
  traceEndpoint: z
    .string()
    .prefault(process.env.COZELOOP_OTLP_ENDPOINT || DEFAULT_TRACE_ENDPOINT),
  /** CozeLoop API token, use process.env.COZELOOP_API_TOKEN when unprovided */
  token: z
    .string()
    .prefault(process.env.COZELOOP_API_TOKEN || '')
    .refine(val => Boolean(val), {
      message: formatPropertyUnprovidedError('token', 'COZELOOP_API_TOKEN'),
    }),
  /** Export passthrough headers */
  headers: z.record(z.string(), z.string()).prefault({}),
  /** Export batch size, default to `100` */
  batchSize: z.number().gt(0).prefault(DEFAULT_BATCH_SIZE),
  /** Export batch report delay, default to `20`ms */
  scheduleDelay: z.number().gt(0).prefault(DEFAULT_SCHEDULE_DELAY),
});

export type CozeloopSpanExporterOptions = Partial<
  z.infer<typeof CozeloopSpanExporterOptionsSchema>
>;
