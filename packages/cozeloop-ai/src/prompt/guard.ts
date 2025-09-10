import { type ContentPart, type Message } from './types';

export function isMessage(val: unknown): val is Message {
  if (typeof val !== 'object' || !val) {
    return false;
  }

  const roleSet = new Set(['system', 'user', 'tool', 'assistant']);

  return 'role' in val && typeof val.role === 'string' && roleSet.has(val.role);
}

export function isMessageArr(val: unknown): val is Message[] {
  return Array.isArray(val) && val.every(it => isMessage(it));
}

export function isContentPart(val: unknown): val is ContentPart {
  if (
    typeof val !== 'object' ||
    !val ||
    !('type' in val) ||
    typeof val.type !== 'string'
  ) {
    return false;
  }

  if (val.type === 'text') {
    return 'text' in val && typeof val.text === 'string';
  }

  if (val.type === 'image_url') {
    return Boolean(
      'image_url' in val &&
        typeof val.image_url === 'object' &&
        val.image_url &&
        'url' in val.image_url &&
        typeof val.image_url.url === 'string',
    );
  }

  return false;
}

export function isContentParts(val: unknown): val is ContentPart[] {
  return Array.isArray(val) && val.every(it => isContentPart(it));
}
