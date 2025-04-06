// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export const ROOT_SPAN_PARENT_ID = '0';

export const COZELOOP_LOGGER_TRACER_TAG = 'Tracer';

export enum COZELOOP_TRACE_IDENTIFIER {
  LOOP = 'cozeloop-js',
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

  // Reserved tags
  SPAN_USER_ID = 'cozeloop_user_id',
  SPAN_MESSAGE_ID = 'cozeloop_message_id',
  SPAN_THREAD_ID = 'cozeloop_thread_id',
  SPAN_LOG_ID = 'cozeloop_span_log_id',
  SPAN_PSM = 'cozeloop_psm',
  SPAN_METHOD = 'cozeloop_method',
  SPAN_CALL_TYPE = 'cozeloop_call_type',
}

export enum COZELOOP_TRACE_BUSINESS_TAGS {
  // Tags for Model span
  START_TIME_FIRST_RESP = 'start_time_first_resp', // The unit is microseconds.
  MODEL_NAME = 'model_name',
  MODEL_PROVIDER = 'model_provider',
  INPUT_TOKENS = 'input_tokens',
  OUTPUT_TOKENS = 'output_tokens',
  TOKENS = 'tokens',
  CALL_OPTIONS = 'call_options', // Used to identify option for model, like temperature, etc. Recommend use ModelCallOption struct.
  STREAM = 'stream', // Used to identify whether it is a streaming output.
  REASONING_TOKENS = 'reasoning_tokens', // The token usage during the reasoning process.
  REASONING_DURATION = 'reasoning_duration', // The duration during the reasoning process. The unit is microseconds.

  // Tags for Retriever span
  RETRIEVER_PROVIDER = 'retriever_provider', // Data retrieval providers, such as Elasticsearch (ES), VikingDB, etc.
  VIKINGDB_NAME = 'vikingdb_name', // When using VikingDB to provide retrieval capabilities, db name.
  VIKINGDB_REGION = 'vikingdb_region', //When using VikingDB to provide retrieval capabilities, db region.
  ES_NAME = 'es_name', // When using ES to provide retrieval capabilities, es name.
  ES_INDEX = 'es_index', //When using ES to provide retrieval capabilities, es index.
  ES_CLUSTER = 'es_cluster', // When using ES to provide retrieval capabilities, es cluster.

  // Tags for Prompt span
  PROMPT_PROVIDER = 'prompt_provider', // Prompt providers, such as CozeLoop, Langsmith, etc.
  PROMPT_KEY = 'prompt_key',
  PROMPT_VERSION = 'prompt_version',
}

export enum COZELOOP_TRACE_OPTIONS {
  ULTRA_LARGE_REPORT = 'ultra_large_report',
  RECORD_INPUTS = 'record_inputs',
  RECORD_OUTPUTS = 'record_outputs',
}
