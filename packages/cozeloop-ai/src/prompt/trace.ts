// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { serializeTagValue } from '../tracer/utils';
import {
  type PromptQuery,
  type LoopMessage,
  type ExecutePromptReq,
  type ExecutePromptReply,
} from '../api';
import { type Message, type PromptVariables } from './types';
import {
  COZELOOP_TRACE_BASIC_TAGS,
  COZELOOP_TRACE_BUSINESS_TAGS,
} from '../tracer';

export function toPromptHubInput({ prompt_key, version, label }: PromptQuery) {
  return serializeTagValue({
    prompt_key,
    prompt_version: version,
    prompt_label: label,
  });
}

export function toPromptTemplateInput(
  messages?: LoopMessage[],
  variables?: PromptVariables,
) {
  return serializeTagValue({
    templates: messages,
    arguments: Object.entries(variables || {}).map(([key, value]) => ({
      key,
      source: 'input',
      value,
    })),
  });
}

export function toPromptTemplateOutput(messages: Message[]) {
  return serializeTagValue(messages);
}

export function toPtaaSModelName(req: ExecutePromptReq) {
  if (!req.prompt_identifier) {
    return undefined;
  }

  const { prompt_key, version, label } = req.prompt_identifier;

  // Priority: version > label
  // Format: prompt_key@version or prompt_key|label or prompt_key
  if (version) {
    return `${prompt_key}@${version}`;
  }
  if (label) {
    return `${prompt_key}|${label}`;
  }
  return prompt_key;
}

function toTraceMessage(message: LoopMessage) {
  const { role, content, parts, reasoning_content, tool_call_id, tool_calls } =
    message;

  return {
    role,
    content,
    reasoning_content: reasoning_content || undefined,
    parts: parts?.length ? parts : undefined,
    tool_call_id: tool_call_id || undefined,
    tool_calls: tool_calls?.length
      ? tool_calls.map(it => ({
          id: it.id,
          type: 'function',
          function: it.function_call,
        }))
      : undefined,
  };
}

export function toPtaaSReqTags(req: ExecutePromptReq, stream?: boolean) {
  return {
    [COZELOOP_TRACE_BASIC_TAGS.SPAN_INPUT]: serializeTagValue(req),
    [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_PROVIDER]: 'Cozeloop PtaaS',
    [COZELOOP_TRACE_BUSINESS_TAGS.MODEL_NAME]: toPtaaSModelName(req),
    [COZELOOP_TRACE_BUSINESS_TAGS.STREAM]: Boolean(stream),
  };
}

export function toModelOutput(reply?: ExecutePromptReply) {
  if (!reply?.message) {
    return undefined;
  }

  return serializeTagValue({
    choices: [
      {
        index: 0,
        finish_reason: reply.finish_reason,
        message: toTraceMessage(reply.message),
      },
    ],
  });
}

export function toPtaasRespTags(resp?: ExecutePromptReply) {
  return {
    [COZELOOP_TRACE_BASIC_TAGS.SPAN_OUTPUT]: toModelOutput(resp),
    [COZELOOP_TRACE_BUSINESS_TAGS.INPUT_TOKENS]: resp?.usage?.input_tokens,
    [COZELOOP_TRACE_BUSINESS_TAGS.OUTPUT_TOKENS]: resp?.usage?.output_tokens,
  };
}
