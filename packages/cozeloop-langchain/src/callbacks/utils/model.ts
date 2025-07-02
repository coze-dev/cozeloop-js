import { type LLMResult } from '@langchain/core/outputs';
import { type Serialized } from '@langchain/core/load/serializable';

import { parseRawMessage } from './message';

export function guessModelProvider(modelName: string) {
  if (!modelName) {
    return '';
  }

  const guessMap = {
    Doubao: /doubao/i,
    Gemini: /gemini/i,
    Anthropic: /claude/i,
    'Open AI': /gpt|o\d/i,
    Grok: /grok/i,
    DeepSeek: /deepseek/i,
    Qwen: /qwen/i,
    MoonShot: /moonshot/i,
    Ernie: /ernie/i,
    Minimax: /minimax/i,
  };

  for (const [provider, reg] of Object.entries(guessMap)) {
    if (reg.test(modelName)) {
      return provider;
    }
  }

  return modelName;
}

export function extractLLMAttributes(
  llm: Serialized,
  extraParams?: Record<string, unknown>,
  metadata?: Record<string, unknown>,
) {
  const mixed: Record<string, unknown> = {
    ...(extraParams?.invocation_params || {}),
    ...(metadata || {}),
  };

  // guess model name
  const name =
    llm.id.at(-1) ||
    mixed.model ||
    mixed.modelName ||
    mixed.model_name ||
    mixed.model_id;

  return {
    model_name: name as string | undefined,
    model_provider: guessModelProvider(`${name}`),
    top_p: mixed.top_p as number,
    top_k: mixed.top_k as number,
    temperature: mixed.temperature as number,
    frequency_penalty: mixed.frequency_penalty as number,
    presence_penalty: mixed.presence_penalty as number,
    max_tokens: mixed.max_tokens as number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- skip
function parseUsage(usage: any = {}) {
  const prompt_tokens = usage.promptTokens ?? usage.prompt_tokens ?? 0;
  const completion_tokens =
    usage.completionTokens ?? usage.completion_tokens ?? 0;
  const total_tokens = usage.totalTokens ?? usage.total_tokens ?? 0;

  return { prompt_tokens, completion_tokens, total_tokens };
}

export function parseLLMResult(result?: LLMResult) {
  if (!result) {
    return undefined;
  }

  const { generations, llmOutput } = result;

  if (!generations?.length || !generations[0].length) {
    return undefined;
  }

  const choices: unknown[] = [];
  // 🌰 llmOutput {
  //   tokenUsage: { promptTokens: 81, completionTokens: 39, totalTokens: 120 }
  // }
  const usage = parseUsage(llmOutput?.tokenUsage);

  let model_name: string | undefined;

  let cnt = 0;
  for (const list of generations) {
    for (const it of list) {
      cnt++;
      model_name = model_name ?? it.generationInfo?.model_name;
      choices.push({
        index: cnt,
        message: parseRawMessage(it),
        finish_reason: it.generationInfo?.finish_reason,
      });
    }
  }

  return {
    model_name,
    choices,
    usage,
  };
}
