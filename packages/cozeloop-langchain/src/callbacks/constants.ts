// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export enum CozeloopAttr {
  WORKSPACE_ID = 'cozeloop.workspace_id',
  SPAN_TYPE = 'cozeloop.span_type',
  INPUT = 'cozeloop.input',
  OUTPUT = 'cozeloop.output',
  SESSION_ID = 'session.id',
  USER_ID = 'user.id',
  MSG_ID = 'messaging.message.id',
  ERROR_MSG = 'error.message',
  // Model
  STREAMING = 'cozeloop.stream',
  LATENCY_FIRST_RESP = 'cozeloop.start_time_first_resp',
  MODEL_PROVIDER = 'gen_ai.system',
  REQUEST_MODEL = 'gen_ai.request.model',
  RESPONSE_MODEL = 'gen_ai.response.model',
  TEMPERATURE = 'gen_ai.request.temperature',
  MAX_TOKENS = 'gen_ai.request.max_tokens',
  TOP_P = 'gen_ai.request.top_p',
  TOP_K = 'gen_ai.request.top_k',
  FREQUENCY_PENALTY = 'gen_ai.request.frequency_penalty',
  PRESENCE_PENALTY = 'gen_ai.request.presence_penalty',
  INPUT_TOKENS = 'gen_ai.usage.input_tokens',
  OUTPUT_TOKENS = 'gen_ai.usage.output_tokens',
  TOTAL_TOKENS = 'gen_ai.usage.total_tokens',
  // STOP_SEQUENCES = 'gen_ai.request.stop_sequences',
  // Prompt
  PROMPT_KEY = 'cozeloop.prompt_key',
  PROMPT_VERSION = 'cozeloop.prompt_version',
  PROMPT_PROVIDER = 'cozeloop.prompt_provider',
}

export enum CozeloopSpanType {
  MODEL = 'model',
  PROMPT = 'prompt',
  RETRIEVER = 'retriever',
  TOOL = 'tool',
  CHAIN = 'chain',
  GRAPH = 'graph',
  AGENT = 'agent',
  CUSTOM = 'custom',
}
