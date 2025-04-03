// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { stringifyVal } from '../utils/common';
import type { Message, PromptQuery, PromptTemplate, VariableDef } from '../api';
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

export function formatPromptTemplate(
  promptTemplate?: PromptTemplate,
  variables?: PromptVariables,
) {
  if (!promptTemplate?.messages.length) {
    return [];
  }

  const { messages, template_type, variable_defs } = promptTemplate;
  const variableMap = buildVariableMap(variable_defs, variables);
  const formattedMessages: Message[] = [];

  messages.forEach(it => {
    formattedMessages.push(...formatMessage(it, template_type, variableMap));
  });

  return formattedMessages;
}

function formatMessage(
  message: Message,
  templateType: PromptTemplate['template_type'],
  variableMap: PromptVariableMap,
): Message[] {
  const { role, content = '' } = message;

  switch (role) {
    case 'system':
    case 'user':
    case 'assistant':
    case 'tool':
      return [
        { role, content: interpolateText(content, templateType, variableMap) },
      ];
    case 'placeholder':
      return interpolatePlaceholder(content, templateType, variableMap);
    default:
      throw new Error(`[formatMessage] unsupported message role ${role}`);
  }
}

function interpolateText(
  content: string,
  templateType: PromptTemplate['template_type'],
  variableMap: PromptVariableMap,
) {
  // content is empty
  // only support normal template now
  // no variables
  if (
    templateType !== 'normal' ||
    !content ||
    !Object.keys(variableMap).length
  ) {
    return content;
  }

  return content.replace(/\{\{([a-zA-Z]\w{0,49})\}\}/gm, (_, key) => {
    const val = variableMap[key];

    // only replace variable with string type
    return val?.def.type === 'string' ? stringifyVal(val.value) : `{{${key}}}`;
  });
}

function interpolatePlaceholder(
  placeholderName: string,
  templateType: PromptTemplate['template_type'],
  variableMap: PromptVariableMap,
) {
  if (
    !placeholderName ||
    templateType !== 'normal' ||
    !Object.keys(variableMap).length
  ) {
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
