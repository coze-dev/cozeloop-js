import { randomBytes } from 'node:crypto';

import { type Serialized } from '@langchain/core/dist/load/serializable';

export function generateUUID(): string {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, it => {
    const v = Number(it);

    return (v ^ (randomBytes(1)[0] & (15 >> (v / 4)))).toString(16);
  });
}

export function stringifyVal(val: unknown): string {
  switch (typeof val) {
    case 'number':
    case 'bigint':
      return `${val}`;
    case 'boolean':
      return val ? 'true' : 'false';
    case 'string':
    case 'symbol':
      return val.toString();
    case 'object': {
      if (val === null) {
        return '';
      }
      if (val instanceof Date) {
        return val.toISOString();
      }
      if (val instanceof Error) {
        return val.message;
      }
      if (Array.isArray(val)) {
        return val.map(it => stringifyVal(it)).join(',');
      }
      return JSON.stringify(val);
    }
    case 'undefined':
      return '';
    case 'function':
      return `function@${val.name}`;
    default:
      return '';
  }
}

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
