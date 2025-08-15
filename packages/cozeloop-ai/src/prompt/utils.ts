// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import nj from 'nunjucks';

import { stringifyVal } from '../utils/common';
import type {
  FormattedMessage,
  Message,
  PromptQuery,
  PromptTemplate,
  VariableDef,
} from '../api';
import type { PromptVariableMap, PromptVariables } from './types';

function buildVariableMap(
  variableDefs: VariableDef[],
  variables?: PromptVariables,
): PromptVariableMap {
  const variableMap: PromptVariableMap = {};
  const variableKeys = new Set<string>(Object.keys(variables || {}));

  for (const def of variableDefs) {
    if (!variableKeys.has(def.key)) {
      continue;
    }

    variableMap[def.key] = {
      def,
      value: variables?.[def.key],
    };
  }

  return variableMap;
}

function interpolateJinja(content: string, variables?: PromptVariables) {
  if (!variables || !Object.keys(variables).length) {
    return content;
  }

  return nj.renderString(content, variables);
}

function interpolateNormal(content: string, variableMap?: PromptVariableMap) {
  if (!variableMap || !Object.keys(variableMap).length) {
    return content;
  }

  return content.replace(/\{\{([a-zA-Z]\w{0,49})\}\}/gm, (_, key) => {
    const val = variableMap[key];

    // only replace variable with string type
    return val?.def.type === 'string' ? stringifyVal(val.value) : `{{${key}}}`;
  });
}

export function formatPromptTemplate(
  promptTemplate?: PromptTemplate,
  variables?: PromptVariables,
) {
  if (!promptTemplate?.messages.length) {
    return [];
  }
  // variable_defs may be undefined
  const { messages, template_type, variable_defs = [] } = promptTemplate;
  const variableMap = buildVariableMap(variable_defs, variables);
  const formattedMessages: Message[] = [];
  const interpolator = (content: string) => {
    switch (template_type) {
      case 'normal':
        return interpolateNormal(content, variableMap);
      case 'jinja2':
        return interpolateJinja(content, variables);
      default:
        return content;
    }
  };

  messages.forEach(it => {
    formattedMessages.push(...formatMessage(it, variableMap, interpolator));
  });

  return formattedMessages as FormattedMessage[];
}

function formatMessage(
  message: Message,
  variableMap: PromptVariableMap,
  interpolator: (content: string) => string,
): Message[] {
  const { role, content = '' } = message;

  switch (role) {
    case 'system':
    case 'user':
    case 'assistant':
    case 'tool':
      return [{ role, content: interpolator(content) }];
    case 'placeholder':
      return interpolatePlaceholder(content, variableMap);
    default:
      throw new Error(`[formatMessage] unsupported message role ${role}`);
  }
}

function interpolatePlaceholder(
  placeholderName: string,
  variableMap: PromptVariableMap,
) {
  if (!placeholderName || !Object.keys(variableMap).length) {
    return [];
  }

  const val = variableMap[placeholderName];

  if (val?.def.type !== 'placeholder' || !val.value) {
    return [];
  }

  return Array.isArray(val.value)
    ? (val.value as Message[])
    : [val.value as Message];
}

export function queryToCacheKey(key: string, version?: string) {
  return version ? `${key}@${version}` : key;
}

export function cacheKeyToQuery(cacheKey: string): PromptQuery {
  const lastAtIndex = cacheKey.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return { prompt_key: cacheKey };
  }

  const prompt_key = cacheKey.slice(0, lastAtIndex);
  const version = cacheKey.slice(lastAtIndex + 1) || undefined;

  return { prompt_key, version };
}
