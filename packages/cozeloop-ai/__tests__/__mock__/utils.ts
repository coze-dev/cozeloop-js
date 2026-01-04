// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';

import { type SetupServerApi } from 'msw/lib/node';
import { HttpResponse } from 'msw';

export function headersToJson(headers: Headers) {
  const obj: Record<string, string> = {};
  headers.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
}

function randomSplitString(input?: string): string[] {
  if (!input?.length) {
    return [];
  }

  const result: string[] = [];
  const size = Math.floor(Math.random() * input.length) + 1;
  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

export async function fileToStreamResp(fileName: string) {
  const lines = (await readFile(fileName, 'utf-8')).toString().split('\n\n');
  const stream = new ReadableStream({
    start(controller) {
      const total = lines.length;
      for (let i = 0; i < total; i++) {
        if (!lines[i]) {
          continue;
        }
        const str = i === total - 1 ? lines[i] : `${lines[i]}\n\n`;
        const pieces = randomSplitString(str);

        for (const it of pieces) {
          controller.enqueue(it);
        }
      }
      controller.close();
    },
  });

  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

export function setupMockServer(server: SetupServerApi) {
  // skip mock server when set COZELOOP_E2E = '1'
  const isE2E = process.env.COZELOOP_E2E === '1';

  return {
    start: () => isE2E || server.listen({ onUnhandledRequest: 'bypass' }),
    close: () => isE2E || server.close(),
    reset: () => isE2E || server.resetHandlers(),
  };
}

export function successResp(data: unknown) {
  return HttpResponse.json({ code: 0, msg: '', data });
}
