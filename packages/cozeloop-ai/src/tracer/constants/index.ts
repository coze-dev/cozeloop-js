// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export const ROOT_SPAN_PARENT_ID = '0';

export enum COZELOOP_TRACE_IDENTIFIER {
  LOOP = 'cozeloop-js',
}

export enum COZELOOP_TRACE_SPAN_STATUS_CODE {
  SUCCESS = 0,
  ERROR = 1,
}

/** The Loop trace arributes */
export enum COZELOOP_TRACE_TAGS {
  SPAN_NAME = 'cozeloop_span_name',
  SPAN_TYPE = 'cozeloop_span_type',
  SPAN_INPUT = 'cozeloop_span_input',
  SPAN_OUTPUT = 'cozeloop_span_output',
  PARENT_SPAN_ID = 'cozeloop_parent_span_id',
  SPAN_WORKSPACE_ID = 'cozeloop_workspace_id',
  SPAN_ULTRA_LARGE_REPORT = 'cozeloop_ultra_large_report',

  // Reserved tags
  SPAN_LOG_ID = 'cozeloop_span_log_id',
  SPAN_PSM = 'cozeloop_psm',
  SPAN_METHOD = 'cozeloop_method',
  SPAN_CALL_TYPE = 'cozeloop_call_type',
}

export enum COZELOOP_TRACE_OPTIONS {
  ULTRA_LARGE_REPORT = 'ultra_large_report',
  RECORD_INPUTS = 'record_inputs',
  RECORD_OUTPUTS = 'record_outputs',
}
