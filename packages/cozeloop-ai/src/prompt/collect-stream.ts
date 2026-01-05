// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import type {
  LoopToolCall,
  LoopMessage,
  ExecutePromptReply,
  TokenUsage,
} from '../api';

/**
 * Merge a tool call chunk into existing tool call
 */
function mergeToolCall(
  existing: LoopToolCall,
  toolCall: Partial<LoopToolCall> & {
    index?: number;
    function_call?: { name?: string; arguments?: string };
  },
) {
  if (toolCall.id) {
    existing.id = toolCall.id;
  }
  if (toolCall.type) {
    existing.type = toolCall.type;
  }
  if (toolCall.function_call) {
    if (!existing.function_call) {
      existing.function_call = { name: '', arguments: '' };
    }
    if (toolCall.function_call.name) {
      existing.function_call.name += toolCall.function_call.name;
    }
    if (toolCall.function_call.arguments) {
      existing.function_call.arguments += toolCall.function_call.arguments;
    }
  }
}

/**
 * Create a new tool call entry from a chunk
 */
function createToolCall(
  toolCall: Partial<LoopToolCall> & {
    index?: number;
    function_call?: { name?: string; arguments?: string };
  },
): LoopToolCall {
  return {
    id: toolCall.id || '',
    type: toolCall.type || 'function',
    function_call: {
      name: toolCall.function_call?.name || '',
      arguments: toolCall.function_call?.arguments || '',
    },
  };
}

/**
 * Merge tool calls from a chunk into the tool calls map
 */
function mergeToolCalls(
  toolCallsMap: Map<number, LoopToolCall>,
  toolCalls: Array<
    Partial<LoopToolCall> & {
      index?: number;
      function_call?: { name?: string; arguments?: string };
    }
  >,
) {
  for (const toolCall of toolCalls) {
    const index = toolCall.index ?? 0;
    const existing = toolCallsMap.get(index);

    if (existing) {
      mergeToolCall(existing, toolCall);
    } else {
      toolCallsMap.set(index, createToolCall(toolCall));
    }
  }
}

/**
 * Merge a message chunk into the collected message
 */
function mergeMessageChunk(
  collectedMessage: LoopMessage,
  msg: Partial<LoopMessage>,
  toolCallsMap: Map<number, LoopToolCall>,
) {
  if (msg.role) {
    collectedMessage.role = msg.role;
  }
  if (msg.content) {
    collectedMessage.content = (collectedMessage.content || '') + msg.content;
  }
  if (msg.reasoning_content) {
    collectedMessage.reasoning_content =
      (collectedMessage.reasoning_content || '') + msg.reasoning_content;
  }
  if (msg.tool_call_id) {
    collectedMessage.tool_call_id = msg.tool_call_id;
  }
  if (msg.tool_calls?.length) {
    mergeToolCalls(toolCallsMap, msg.tool_calls);
  }
}

/**
 * Collect and merge streaming reply data while yielding original chunks
 *
 * @param stream The streaming execute prompt response
 * @param onStreamStart Optional callback invoked when stream starts
 * @param onStreamEnd Optional callback invoked when stream ends with the collected reply
 * @returns A new async generator that yields the same chunks and a final collected reply
 *
 * @example
 * ```typescript
 * const stream = await model.stream({ messages: [...] });
 * const { stream: newStream, getCollectedReply } = collectReplyStream(
 *   stream,
 *   () => console.log('Stream started'),
 *   (reply) => console.log('Stream ended', reply)
 * );
 *
 * for await (const chunk of newStream) {
 *   console.log(chunk);
 * }
 *
 * const collectedReply = getCollectedReply();
 * console.log(collectedReply.message.content); // Full merged content
 * console.log(collectedReply.message.tool_calls); // Complete tool calls
 * ```
 */
export function collectReplyStream(
  stream: AsyncGenerator<ExecutePromptReply>,
  onStreamStart?: () => void,
  onStreamEnd?: (reply: ExecutePromptReply) => void,
) {
  const collectedMessage: LoopMessage = {
    role: 'assistant',
    content: '',
    reasoning_content: '',
    tool_call_id: '',
  };
  let finishReason = '';
  let usage: TokenUsage | undefined;
  const toolCallsMap = new Map<number, LoopToolCall>();

  const getCollectedReply = (): ExecutePromptReply => {
    if (toolCallsMap.size > 0) {
      collectedMessage.tool_calls = Array.from(toolCallsMap.values());
    }

    return {
      message: collectedMessage,
      finish_reason: finishReason,
      usage: usage || { input_tokens: 0, output_tokens: 0 },
    };
  };

  async function* generator() {
    let isFirstChunk = true;
    for await (const chunk of stream) {
      if (isFirstChunk) {
        isFirstChunk = false;
        onStreamStart?.();
      }

      const { message, finish_reason, usage: chunkUsage } = chunk;

      if (message) {
        mergeMessageChunk(collectedMessage, message, toolCallsMap);
      }
      if (finish_reason) {
        finishReason = finish_reason;
      }
      if (chunkUsage) {
        usage = chunkUsage;
      }
      yield chunk;
    }

    // Stream has ended, invoke the end callback
    onStreamEnd?.(getCollectedReply());
  }

  return {
    stream: generator(),
    getCollectedReply,
  };
}
