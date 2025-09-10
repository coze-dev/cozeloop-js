import { stringifyVal } from '../utils/common';
import {
  type LoopToolCall,
  type LoopMessage,
  type LoopContentPart,
  type VariableVal,
} from '../api';
import {
  type ToolCall,
  type Message,
  type PromptVariables,
  type ContentPart,
} from './types';
import { isContentParts, isMessage, isMessageArr } from './guard';

export function toLoopToolCalls(toolCalls?: ToolCall[]) {
  if (typeof toolCalls === 'undefined') {
    return undefined;
  }

  if (!toolCalls.length) {
    return [];
  }

  return toolCalls.map<LoopToolCall>(it => ({
    id: it.id,
    type: 'function',
    function_call: {
      name: it.function.name,
      arguments: it.function.arguments,
    },
  }));
}

export function toLoopPart(part: ContentPart): LoopContentPart {
  const { type } = part;
  switch (type) {
    case 'text':
      return { type: 'text', text: part.text };
    case 'image_url':
      return { type: 'image_url', image_url: part.image_url.url };
    default:
      throw new Error(`[toLoopPart] ${type} unsupported`);
  }
}

function toLoopMessage(message: Message): LoopMessage {
  switch (message.role) {
    case 'system':
      return {
        role: 'system',
        content: message.content,
      };
    case 'user':
      return {
        role: 'user',
        content: message.content,
        parts: message.parts?.map(it => toLoopPart(it)),
      };
    case 'tool':
      return {
        role: 'tool',
        content: message.content,
        tool_call_id: message.tool_call_id,
      };
    case 'assistant':
      return {
        role: 'assistant',
        content: message.content,
        parts: message.parts?.map(it => toLoopPart(it)),
        tool_calls: toLoopToolCalls(message.tool_calls),
      };
    default:
      throw new Error(`[toLoopMessage] ${message.role} unsupported`);
  }
}

export function toLoopMessages(messages?: Message[]) {
  if (!messages?.length) {
    return [];
  }

  return messages.map(it => toLoopMessage(it));
}

export function toVariableVal(
  key: string,
  val: PromptVariables[keyof PromptVariables],
): VariableVal | undefined {
  switch (typeof val) {
    case 'string':
    case 'symbol':
    case 'bigint':
    case 'number':
    case 'boolean':
      return { key, value: stringifyVal(val) };
    case 'object': {
      if (val === null) {
        return undefined;
      }

      if (isMessage(val)) {
        return { key, placeholder_messages: [toLoopMessage(val)] };
      }

      if (isMessageArr(val)) {
        return { key, placeholder_messages: toLoopMessages(val) };
      }

      if (isContentParts(val)) {
        return { key, multi_part_values: val.map(it => toLoopPart(it)) };
      }

      return { key, value: stringifyVal(val) };
    }
    case 'undefined':
    case 'function':
    default:
      return undefined;
  }
}

export function toVariableVals(variables?: PromptVariables) {
  if (typeof variables === 'undefined') {
    return undefined;
  }

  const vals: VariableVal[] = [];

  for (const [key, val] of Object.entries(variables)) {
    const vv = toVariableVal(key, val);
    vv && vals.push(vv);
  }

  return vals;
}
