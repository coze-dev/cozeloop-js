import { type Generation } from '@langchain/core/outputs';
import {
  BaseMessage,
  type MessageContentComplex,
  type AIMessageChunk,
} from '@langchain/core/messages';

import { stringifyVal } from './common';

interface LoopMessageContentPart {
  type: 'text' | 'image_url' | 'file_url';
  text?: string;
  image_url?: {
    name?: string;
    url?: string;
    detail?: string;
  };
  file_url?: {
    name?: string;
    url?: string;
    detail?: string;
    suffix?: string;
  };
}

interface LoopToolCall {
  id?: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface LoopMessage {
  role: 'assistant' | 'user' | 'tool' | 'system';
  content?: string;
  parts?: LoopMessageContentPart[];
  tool_calls?: LoopToolCall[];
}

function parseRole(message?: BaseMessage): LoopMessage['role'] {
  switch (message?.getType()) {
    case 'human':
      return 'user';
    case 'ai':
      return 'assistant';
    case 'system':
      return 'system';
    case 'tool':
    case 'function':
      return 'tool';
    case 'remove':
    case 'generic':
    case 'developer':
    default:
      return 'assistant';
  }
}

function parseContent(message?: BaseMessage) {
  if (typeof message?.content === 'string') {
    return message.content;
  }

  return undefined;
}

function parsePart(complex: MessageContentComplex): LoopMessageContentPart {
  switch (complex.type) {
    case 'text':
      return { type: 'text', text: stringifyVal(complex.text) };
    case 'image_url':
      return {
        type: 'image_url',
        image_url:
          typeof complex.image_url === 'string'
            ? { url: complex.image_url }
            : {
                name: complex.image_url?.name,
                url: complex.image_url?.url,
                detail: complex.image_url?.url,
              },
      };
    case 'file_url':
      return {
        type: 'file_url',
        file_url: {
          name: complex.file_url?.name || complex.name,
          url: complex.file_url?.url || complex.url,
        },
      };
    default:
      return { type: 'text', text: stringifyVal(complex) };
  }
}

function parseParts(
  message?: BaseMessage,
): LoopMessageContentPart[] | undefined {
  if (!message?.content.length || typeof message.content === 'string') {
    return undefined;
  }

  return message.content.map(it => parsePart(it));
}

function parseToolCalls(message?: BaseMessage): LoopToolCall[] | undefined {
  const toolCalls = (message as AIMessageChunk | undefined)?.tool_calls;

  if (!toolCalls?.length) {
    return undefined;
  }

  return toolCalls.map(it => ({
    id: it.id,
    type: 'function',
    function: {
      name: it.name,
      arguments: stringifyVal(it.args),
    },
  }));
}

export function parseRawMessage(
  message?: BaseMessage | Generation | string,
): LoopMessage | string | undefined {
  if (typeof message === 'undefined') {
    return undefined;
  }

  if (typeof message === 'string') {
    return message;
  }

  if (message instanceof BaseMessage) {
    return parseBaseMessage(message);
  }

  if ('message' in message) {
    return parseBaseMessage(message.message as BaseMessage);
  }

  return { role: 'assistant', content: message.text };
}

export function parseBaseMessage(message?: BaseMessage): LoopMessage {
  return {
    role: parseRole(message),
    content: parseContent(message),
    parts: parseParts(message),
    tool_calls: parseToolCalls(message),
  };
}

export function parseBaseMessages(messages?: BaseMessage[][]) {
  if (!messages?.[0].length) {
    return undefined;
  }

  const loopMessages: LoopMessage[] = [];

  for (const list of messages) {
    for (const it of list) {
      loopMessages.push(parseBaseMessage(it));
    }
  }

  return loopMessages;
}

export function parseLLMPrompts(prompts?: string[]) {
  if (!prompts?.length) {
    return undefined;
  }

  return prompts.length === 1 ? prompts[0] : prompts;
}
