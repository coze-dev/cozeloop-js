// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates

// SPDX-License-Identifier: MIT
export const ROOT_SPAN_PARENT_ID = '0';

export const COZELOOP_LOGGER_TRACER_TAG = 'Tracer';

export enum COZELOOP_TRACE_IDENTIFIER {
  LOOP = 'cozeloop-js',
}

export enum COZELOOP_TRACE_PROPAGATION_HEADERS {
  W3C_TRACEPARENT = 'traceparent',
  W3C_TRACESTATE = 'tracestate',
  COZELOOP_TRACEPARENT = 'X-Cozeloop-Traceparent',
  COZELOOP_TRACESTATE = 'X-Cozeloop-Tracestate',
}

export enum COZELOOP_TRACE_SPAN_STATUS_CODE {
  SUCCESS = 0,
  ERROR = 1,
}

export enum COZELOOP_TRACE_BASIC_TAGS {
  SPAN_NAME = 'cozeloop_span_name',
  SPAN_TYPE = 'cozeloop_span_type',
  SPAN_INPUT = 'cozeloop_span_input',
  SPAN_OUTPUT = 'cozeloop_span_output',
  PARENT_SPAN_ID = 'cozeloop_parent_span_id',
  SPAN_WORKSPACE_ID = 'cozeloop_workspace_id',
  SPAN_ULTRA_LARGE_REPORT = 'cozeloop_ultra_large_report',
  SPAN_CUSTOM_ROOT_SPAN_ID = 'cozeloop_custom_root_span_id',
  SPAN_RUNTIME_SCENE = 'cozeloop_span_runtime_scene',

  // Reserved tags
  SPAN_LOG_ID = 'cozeloop_span_log_id',
  SPAN_PSM = 'cozeloop_psm',
  SPAN_METHOD = 'cozeloop_method',
  SPAN_CALL_TYPE = 'cozeloop_call_type',
}

export enum COZELOOP_TRACE_BUSINESS_TAGS {
  // Common tags
  ERROR_MESSAGE = 'error',

  // Tags for Model span
  /** The timestamp of the model's first response when using stream response. The unit is microseconds. */
  START_TIME_FIRST_RESP = 'start_time_first_resp',
  MODEL_NAME = 'model_name',
  MODEL_PROVIDER = 'model_provider',
  INPUT_TOKENS = 'input_tokens',
  OUTPUT_TOKENS = 'output_tokens',
  TOKENS = 'tokens',
  /** Used to identify option for model, like temperature, etc. Recommend use ModelCallOption struct. */
  CALL_OPTIONS = 'call_options',
  /** Used to identify whether it is a streaming output. */
  STREAM = 'stream',
  /** The token usage during the reasoning process. */
  REASONING_TOKENS = 'reasoning_tokens',
  /** The duration during the reasoning process. The unit is microseconds. */
  REASONING_DURATION = 'reasoning_duration',

  // Tags for Retriever span
  /** Data retrieval providers, such as Elasticsearch (ES), VikingDB, etc. */
  RETRIEVER_PROVIDER = 'retriever_provider',
  /** When using VikingDB to provide retrieval capabilities, db name. */
  VIKINGDB_NAME = 'vikingdb_name',
  /** When using VikingDB to provide retrieval capabilities, db region. */
  VIKINGDB_REGION = 'vikingdb_region',
  /** When using ES to provide retrieval capabilities, es name. */
  ES_NAME = 'es_name',
  /** When using ES to provide retrieval capabilities, es index. */
  ES_INDEX = 'es_index',
  /** When using ES to provide retrieval capabilities, es cluster. */
  ES_CLUSTER = 'es_cluster',

  // Tags for Prompt span
  /** Prompt providers, such as CozeLoop, Langsmith, etc. */
  PROMPT_PROVIDER = 'prompt_provider',
  PROMPT_KEY = 'prompt_key',
  PROMPT_VERSION = 'prompt_version',
}

export enum COZELOOP_TRACE_OPTIONS {
  ULTRA_LARGE_REPORT = 'ultra_large_report',
  RECORD_INPUTS = 'record_inputs',
  RECORD_OUTPUTS = 'record_outputs',
}
