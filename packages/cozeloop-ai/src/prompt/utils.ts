// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import nj from 'nunjucks';

import { stringifyVal } from '../utils/common';
import type {
  TemplateMessage,
  PromptQuery,
  PromptTemplate,
  VariableDef,
  TemplateContentPart,
} from '../api';
import {
  type Message,
  type ContentPart,
  type PromptVariableMap,
  type PromptVariables,
} from './types';

export function buildVariableMap(
  variableDefs?: VariableDef[],
  variables?: PromptVariables,
): PromptVariableMap {
  const variableMap: PromptVariableMap = {};
  if (!variableDefs?.length) {
    return variableMap;
  }

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

function formatJinjaText(content: string, variables?: PromptVariables) {
  if (!variables || !Object.keys(variables).length) {
    return content;
  }

  return nj.renderString(content, variables);
}

function formatNormalText(content: string, variableMap?: PromptVariableMap) {
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
  const { messages = [], template_type, variable_defs = [] } = promptTemplate;
  const variableMap = buildVariableMap(variable_defs, variables);
  const formattedMessages: Message[] = [];
  // format text by template_type
  const formatText = (content: string) => {
    switch (template_type) {
      case 'normal':
        return formatNormalText(content, variableMap);
      case 'jinja2':
        return formatJinjaText(content, variables);
      default:
        return content;
    }
  };

  for (const it of messages) {
    formattedMessages.push(...formatMessage(it, variableMap, formatText));
  }

  return formattedMessages;
}

function formatPart(
  part: TemplateContentPart,
  variableMap: PromptVariableMap,
  formatText: (content: string) => string,
): ContentPart[] {
  switch (part.type) {
    case 'text':
      return [{ type: 'text', text: formatText(part.text) }];
    case 'multi_part_variable': {
      const variable = variableMap[part.text];
      if (!variable?.value) {
        return [];
      }

      if (variable.def.type !== 'multi_part') {
        throw new Error(
          `[formatPart] unmatched variable type ${part.text}, expect multi_part, found ${variable?.def.type}`,
        );
      }

      return Array.isArray(variable.value)
        ? (variable.value as ContentPart[])
        : [variable.value as ContentPart];
    }
    default:
      throw new Error(`[formatParts] unsupported part type ${part.type}`);
  }
}

function formatParts(
  parts: TemplateContentPart[],
  variableMap: PromptVariableMap,
  formatText: (content: string) => string,
) {
  if (!parts.length) {
    return [];
  }

  const contentParts: ContentPart[] = [];
  for (const it of parts) {
    contentParts.push(...formatPart(it, variableMap, formatText));
  }

  return contentParts;
}

function formatMessage(
  message: TemplateMessage,
  variableMap: PromptVariableMap,
  formatText: (content: string) => string,
): Message[] {
  const { role, content = '', parts } = message;

  switch (role) {
    case 'system':
    case 'user':
    case 'assistant': {
      const formatted: Message = { role, content: formatText(content) };
      if (typeof parts !== 'undefined') {
        formatted.parts = formatParts(parts, variableMap, formatText);
      }
      return [formatted];
    }
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
